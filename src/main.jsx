import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { createRoot } from 'react-dom/client'
import { Archive, ArrowLeft, ArrowRight, AudioLines, BookOpen, BookmarkCheck, BookmarkPlus, Check, ChevronDown, ChevronLeft, ChevronRight, GraduationCap, GripVertical, Lightbulb, LockKeyhole, Mic, Pause, Pencil, Plus, Presentation, RotateCcw, Sparkles, Trash2, Volume2, X } from 'lucide-react'
import { getWritingType } from '../writing-types.mjs'
import './styles.css'

async function askAi(path, payload, timeoutMs = 120_000, maxAttempts = Number.POSITIVE_INFINITY) {
  let attempt = 0
  let lastError
  while (true) {
    try {
      const response = await fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(timeoutMs),
      })
      const data = await response.json()
      if (response.ok) return data
      if (response.status === 503 && /cấu hình kết nối AI|chưa cấu hình|không hợp lệ/i.test(data.error || '')) throw new Error(data.error)
      if (![408, 429, 500, 502, 503, 504].includes(response.status)) throw new Error(data.error || 'Yêu cầu chưa hợp lệ.')
      lastError = new Error(data.error || 'Dịch vụ AI đang bận.')
    } catch (error) {
      if (error instanceof Error && error.message && !['TimeoutError', 'AbortError', 'TypeError', 'SyntaxError'].includes(error.name)) throw error
      lastError = error
    }
    attempt += 1
    if (attempt >= maxAttempts) throw lastError || new Error('Chưa hoàn tất yêu cầu tạo hình.')
    const waitMs = Math.min(30_000, 1_000 * (2 ** Math.min(attempt, 5)))
    await new Promise(resolve => window.setTimeout(resolve, waitMs))
  }
}

async function requestArchive(path = '/api/archive', payload) {
  let response
  try {
    response = await fetch(path, {
      method: payload === undefined ? 'GET' : 'POST',
      headers: payload === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: payload === undefined ? undefined : JSON.stringify(payload),
      signal: AbortSignal.timeout(15_000),
    })
  } catch {
    throw new Error('Chưa kết nối được với kho lưu trữ trên máy chủ. Em thử lại nhé.')
  }
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Chưa cập nhật được kho lưu trữ.')
  return data.entries || []
}

function tidyTranscript(text) {
  const before = text.match(/[\p{L}\p{M}\p{N}]+/gu) || []
  const withoutFillers = text
    .replace(/(^|[\s,])(?:ờ+|ừm+|um+)(?=[\s,.!?]|$)/gi, '$1')
  const parts = withoutFillers.match(/[\p{L}\p{M}\p{N}]+|[^\p{L}\p{M}\p{N}]+/gu) || []
  const keepRepeated = new Set(['rất', 'xa', 'xanh', 'đỏ', 'nho', 'nhỏ', 'lâu', 'đi', 'nhanh', 'chậm', 'đều', 'từ'])
  const collapsed = []
  let lastWordIndex = -1
  let lastWord = ''
  for (const part of parts) {
    if (/^[\p{L}\p{M}\p{N}]+$/u.test(part)) {
      const word = part.toLocaleLowerCase('vi-VN')
      const separator = collapsed.slice(lastWordIndex + 1).join('')
      const isStutter = lastWordIndex >= 0 && word === lastWord && !keepRepeated.has(word) && /^[\s,;:…—–-]*$/u.test(separator)
      if (isStutter) collapsed.splice(lastWordIndex + 1)
      else { collapsed.push(part); lastWordIndex = collapsed.length - 1; lastWord = word }
    } else collapsed.push(part)
  }
  const cleaned = collapsed.join('')
    .replace(/\s+([,.!?])/g, '$1')
    .replace(/([.!?])(?=\S)/g, '$1 ')
    .replace(/\s+/g, ' ')
    .trim()
  if (!cleaned) return { text: text.trim(), removedWords: 0 }
  const punctuated = /[.!?]$/.test(cleaned) ? cleaned : `${cleaned}.`
  return {
    text: punctuated.charAt(0).toLocaleUpperCase('vi-VN') + punctuated.slice(1),
    removedWords: Math.max(0, before.length - (cleaned.match(/[\p{L}\p{M}\p{N}]+/gu) || []).length),
  }
}

function readRememberedGrade() {
  try { return window.localStorage.getItem('voice-to-thought-grade') === '5' ? 5 : 4 }
  catch { return 4 }
}

const RETIRED_SAVED_ESSAYS_KEY = 'voice-to-thought-grade-4-saved-essays'

const OUTLINE_SECTIONS = ['Mở bài', 'Thân bài', 'Kết bài']

function normalizeOutlineSection(section = '') {
  const normalized = section.toLocaleLowerCase('vi-VN')
  if (normalized.includes('mở bài') || normalized.includes('mở đầu') || normalized.includes('giới thiệu')) return 'Mở bài'
  if (normalized.includes('kết bài') || normalized.includes('kết thúc') || normalized.includes('cảm nghĩ') || normalized.includes('bài học')) return 'Kết bài'
  return 'Thân bài'
}

function getIdeaText(idea) {
  return [idea.label?.trim(), idea.detail?.trim()].filter(Boolean).join(idea.label?.trim() && idea.detail?.trim() ? ': ' : '')
}

function groupIdeasBySection(ideas = []) {
  const groups = OUTLINE_SECTIONS.map(section => ({ section, ideas: [] }))
  ideas.forEach(idea => {
    const section = normalizeOutlineSection(idea.section)
    groups.find(group => group.section === section)?.ideas.push(idea)
  })
  return groups
}

function resizeTextarea(element) {
  if (!element) return
  element.style.height = 'auto'
  element.style.height = `${element.scrollHeight}px`
}

function AccessGate({ onLogin }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async event => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/access/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Không thể mở ứng dụng. Bạn thử lại nhé.')
      onLogin()
    } catch (loginError) {
      setError(loginError.message || 'Mình chưa kết nối được. Bạn thử lại nhé.')
    } finally {
      setBusy(false)
    }
  }

  return <main className="access-screen">
    <div className="access-card">
      <div className="access-icon"><LockKeyhole size={34}/></div>
      <p className="eyebrow">VOICE TO THOUGHT</p>
      <h1>Chào mừng cô An!</h1>
      <p className="access-description">Nhập mật khẩu để mở ứng dụng nhé.</p>
      <form onSubmit={submit}>
        <label htmlFor="app-password">Mật khẩu</label>
        <input id="app-password" type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} autoFocus required />
        {error && <p className="access-error" role="alert">{error}</p>}
        <button type="submit" disabled={busy || !password}>{busy ? 'Đang kiểm tra…' : 'Mở ứng dụng'} <ArrowRight size={19}/></button>
      </form>
      <p className="access-credit">Ứng dụng này được xây dựng và phát triển bởi cô Thúy An</p>
    </div>
  </main>
}

function App() {
  const [accessChecked, setAccessChecked] = useState(false)
  const [accessGranted, setAccessGranted] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [reviewText, setReviewText] = useState('')
  const [removedWords, setRemovedWords] = useState(0)
  const [recording, setRecording] = useState(false)
  const [hasRecordedSpeech, setHasRecordedSpeech] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [screen, setScreen] = useState('capture')
  const [analysis, setAnalysis] = useState(null)
  const [outlineDeveloped, setOutlineDeveloped] = useState(false)
  const [outlineDevelopLoading, setOutlineDevelopLoading] = useState(false)
  const [outlineQuestionEditing, setOutlineQuestionEditing] = useState({})
  const [gradeLevel, setGradeLevel] = useState(readRememberedGrade)
  const [teacherMenuOpen, setTeacherMenuOpen] = useState(false)
  const [outlineEditing, setOutlineEditing] = useState(false)
  const [editingIdeaId, setEditingIdeaId] = useState(null)
  const [editDraft, setEditDraft] = useState('')
  const [draggedIdeaId, setDraggedIdeaId] = useState(null)
  const [dropTarget, setDropTarget] = useState(null)
  const [projectionOpen, setProjectionOpen] = useState(false)
  const [projectionKind, setProjectionKind] = useState('outline')
  const [projectionView, setProjectionView] = useState('all')
  const [projectionSectionIndex, setProjectionSectionIndex] = useState(0)
  const [aiNote, setAiNote] = useState('')
  const [clarificationQuestion, setClarificationQuestion] = useState('')
  const [clarification, setClarification] = useState('')
  const [working, setWorking] = useState(false)
  const [aiError, setAiError] = useState('')
  const [suggestionLoading, setSuggestionLoading] = useState(false)
  const [suggestionError, setSuggestionError] = useState('')
  const [suggestionApplyLoading, setSuggestionApplyLoading] = useState(false)
  const [suggestionsApplied, setSuggestionsApplied] = useState(false)
  const [suggestionHistory, setSuggestionHistory] = useState([])
  const [outlineVersionHistory, setOutlineVersionHistory] = useState({})
  const [outlineChangingSection, setOutlineChangingSection] = useState('')
  const [outlineConfirmLoading, setOutlineConfirmLoading] = useState(false)
  const [outlineConfirmed, setOutlineConfirmed] = useState(false)
  const [essay, setEssay] = useState(null)
  const [essayHistory, setEssayHistory] = useState([])
  const [essayVersion, setEssayVersion] = useState(0)
  const [essayLoading, setEssayLoading] = useState(false)
  const [essayError, setEssayError] = useState('')
  const [essayIllustration, setEssayIllustration] = useState('')
  const [essayImageLoading, setEssayImageLoading] = useState(false)
  const [essayOpen, setEssayOpen] = useState(false)
  const [essayClosing, setEssayClosing] = useState(false)
  const [essaySaved, setEssaySaved] = useState(false)
  const [savedEssays, setSavedEssays] = useState([])
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [selectedSavedEssayId, setSelectedSavedEssayId] = useState(null)
  const [archiveError, setArchiveError] = useState('')
  const [archiveLoading, setArchiveLoading] = useState(false)
  const [archiveSaving, setArchiveSaving] = useState(false)
  const archiveRefreshSequenceRef = useRef(0)
  const recognitionRef = useRef(null)
  const baseTextRef = useRef('')
  const finalTextRef = useRef('')
  const timerRef = useRef(null)
  const essayCloseTimerRef = useRef(null)
  const essayImageRequestRef = useRef(0)
  const essayDialogRef = useRef(null)
  const essayCloseButtonRef = useRef(null)
  const essayTriggerRef = useRef(null)
  const essayProjectionTriggerRef = useRef(null)
  const archiveTriggerRef = useRef(null)
  const teacherMenuRef = useRef(null)
  const projectionContentRef = useRef(null)
  const archiveDialogRef = useRef(null)
  const projectionTriggerRef = useRef(null)
  const transcriptTextareaRef = useRef(null)
  const reviewTextareaRef = useRef(null)

  const refreshSavedEssays = async ({ showLoading = true } = {}) => {
    const refreshSequence = ++archiveRefreshSequenceRef.current
    if (showLoading) setArchiveLoading(true)
    try {
      let entries = await requestArchive()
      if (refreshSequence === archiveRefreshSequenceRef.current) {
        setSavedEssays(entries)
        setArchiveError('')
      }
    } catch (error) {
      if (refreshSequence === archiveRefreshSequenceRef.current) setArchiveError(error.message)
    } finally {
      if (showLoading && refreshSequence === archiveRefreshSequenceRef.current) setArchiveLoading(false)
    }
  }

  useEffect(() => {
    if (!accessGranted) return
    try { window.localStorage.removeItem(RETIRED_SAVED_ESSAYS_KEY) } catch {}
    refreshSavedEssays()
  }, [accessGranted])

  useEffect(() => {
    if (!archiveOpen) return undefined
    const syncArchive = () => {
      if (document.visibilityState === 'visible') refreshSavedEssays({ showLoading: false })
    }
    const interval = window.setInterval(syncArchive, 5000)
    window.addEventListener('focus', syncArchive)
    document.addEventListener('visibilitychange', syncArchive)
    return () => {
      window.clearInterval(interval)
      window.removeEventListener('focus', syncArchive)
      document.removeEventListener('visibilitychange', syncArchive)
    }
  }, [archiveOpen])

  useEffect(() => {
    if (!teacherMenuOpen) return undefined
    const closeOnOutsideClick = event => {
      if (!teacherMenuRef.current?.contains(event.target)) setTeacherMenuOpen(false)
    }
    const closeOnEscape = event => {
      if (event.key === 'Escape') setTeacherMenuOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [teacherMenuOpen])

  useEffect(() => {
    let active = true
    fetch('/api/access/status')
      .then(response => response.json())
      .then(data => { if (active) setAccessGranted(Boolean(data.authenticated)) })
      .catch(() => { if (active) setAccessGranted(false) })
      .finally(() => { if (active) setAccessChecked(true) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const textarea = transcriptTextareaRef.current
      resizeTextarea(textarea)
      if (recording && screen === 'capture' && transcript) {
        textarea?.scrollIntoView({ block: 'end', behavior: 'auto' })
      }
    })
    return () => window.cancelAnimationFrame(frame)
  }, [transcript, screen, recording])

  useEffect(() => {
    resizeTextarea(reviewTextareaRef.current)
  }, [reviewText, screen])

  const formatTime = value => `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      window.alert('Trình duyệt này chưa hỗ trợ ghi âm. Em có thể gõ suy nghĩ vào ô bên dưới nhé!')
      return
    }
    const recognition = new SpeechRecognition()
    recognition.lang = 'vi-VN'
    recognition.continuous = true
    recognition.interimResults = true
    baseTextRef.current = transcript.trim()
    finalTextRef.current = ''
    recognition.onresult = event => {
      let finalPart = ''
      let interimPart = ''
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index]
        if (result.isFinal) finalPart += `${result[0].transcript} `
        else interimPart += result[0].transcript
      }
      finalTextRef.current += finalPart
      setTranscript([baseTextRef.current, finalTextRef.current, interimPart].filter(Boolean).join(' ').trim())
    }
    recognition.onerror = () => { setRecording(false); window.clearInterval(timerRef.current) }
    recognition.onend = () => { setRecording(false); window.clearInterval(timerRef.current) }
    recognitionRef.current = recognition
    setAnalysis(null)
    setOutlineDeveloped(false)
    setHasRecordedSpeech(true)
    setScreen('capture')
    setElapsed(0)
    setRecording(true)
    timerRef.current = window.setInterval(() => setElapsed(value => value + 1), 1000)
    recognition.start()
  }

  const stopRecording = () => {
    recognitionRef.current?.stop()
    setRecording(false)
    window.clearInterval(timerRef.current)
  }

  const openAnalysis = async () => {
    if (!transcript.trim()) return
    if (!hasRecordedSpeech) {
      await analyzeTranscript(transcript, '')
      return
    }
    const localSuggestion = tidyTranscript(transcript)
    setWorking(true)
    setAiError('')
    setClarification('')
    try {
      const result = await askAi('/api/prepare', { transcript, grade: gradeLevel })
      setReviewText(result.cleanedTranscript)
      setRemovedWords(localSuggestion.removedWords)
      setAiNote(result.cleanupNote)
      setClarificationQuestion(result.needsClarification ? result.clarificationQuestion : '')
      setScreen('review')
    } catch (error) {
      setAiError(error.message)
    } finally {
      setWorking(false)
    }
  }

  const analyzeTranscript = async (text, clarificationText = '') => {
    if (!text.trim()) return
    setWorking(true)
    setAiError('')
    setReviewText(text)
    setClarification(clarificationText)
    try {
      const result = await askAi('/api/analyze', { transcript: text, clarification: clarificationText, grade: gradeLevel })
      setAnalysis({
        ...result,
        ideas: result.ideas.map((idea, index) => ({
          ...idea,
          section: normalizeOutlineSection(idea.section),
          id: window.crypto?.randomUUID?.() || `${Date.now()}-${index}`,
        })),
      })
      setOutlineDeveloped(false)
      setOutlineQuestionEditing({})
      setOutlineEditing(false)
      setEditingIdeaId(null)
      setSuggestionHistory([])
      setOutlineVersionHistory({})
      setOutlineChangingSection('')
      setOutlineConfirmLoading(false)
      setOutlineConfirmed(false)
      setSuggestionError('')
      setSuggestionsApplied(false)
      setEssay(null)
      setEssayHistory([])
      setEssayVersion(0)
      setScreen('results')
    } catch (error) {
      setAiError(error.message)
    } finally {
      setWorking(false)
    }
  }

  const confirmTranscript = async () => analyzeTranscript(reviewText, clarification)

  const developOutline = async () => {
    if (!analysis || outlineDevelopLoading) return
    setOutlineDevelopLoading(true)
    setSuggestionError('')
    try {
      const result = await askAi('/api/develop-outline', {
        transcript: reviewText,
        clarification,
        grade: gradeLevel,
        analysis,
      }, 300_000)
      const answers = result.answers || []
      const sectionPositions = { 'Mở bài': 0, 'Thân bài': 0, 'Kết bài': 0 }
      const ideas = answers.map((item, index) => {
        const section = normalizeOutlineSection(item.section)
        const matchingQuestionIndex = analysis.outlineQuestions.findIndex(question => question.section === section && question.question === item.question)
        sectionPositions[section] += 1
        return {
          section,
          label: '',
          detail: item.answer,
          source: item.source,
          answerNumber: matchingQuestionIndex >= 0
            ? analysis.outlineQuestions.slice(0, matchingQuestionIndex + 1).filter(question => question.section === section).length
            : sectionPositions[section],
          id: window.crypto?.randomUUID?.() || `${Date.now()}-developed-${index}`,
        }
      })
      if (!ideas.length) throw new Error('Chưa tạo được câu trả lời cho dàn ý. Em thử lại nhé.')
      setAnalysis(current => current ? { ...current, ideas } : current)
      setOutlineDeveloped(true)
      setOutlineEditing(false)
      setSuggestionsApplied(false)
      setOutlineConfirmed(false)
      setEssay(null)
      setEssayHistory([])
    } catch (error) {
      setSuggestionError(error.message)
    } finally {
      setOutlineDevelopLoading(false)
    }
  }

  const generateAlternativeSuggestion = async () => {
    if (!analysis || suggestionLoading) return
    setSuggestionLoading(true)
    setSuggestionError('')
    try {
      const currentSuggestionSet = { suggestion: analysis.suggestion, questions: analysis.questions }
      const previousSuggestions = [...suggestionHistory, currentSuggestionSet].slice(-6)
      const result = await askAi('/api/alternate-suggestion', {
        transcript: reviewText,
        grade: gradeLevel,
        analysis,
        previousSuggestions,
      })
      const normalize = value => value.toLocaleLowerCase('vi-VN').replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
      const suggestionRepeated = previousSuggestions.some(previous => normalize(previous.suggestion) === normalize(result.suggestion))
      const repeatedQuestion = result.questions.some(question => previousSuggestions.some(previous => previous.questions.some(oldQuestion => normalize(oldQuestion) === normalize(question))))
      if (suggestionRepeated || repeatedQuestion) {
        throw new Error('Gợi ý hoặc câu hỏi mới vừa rồi hơi giống lần trước. Cô thử bấm lại nhé.')
      }
      setSuggestionHistory(history => [...history, currentSuggestionSet].slice(-6))
      setAnalysis(current => current ? { ...current, suggestion: result.suggestion, questions: result.questions } : current)
      setSuggestionsApplied(false)
      setEssay(null)
    } catch (error) {
      setSuggestionError(error.message)
    } finally {
      setSuggestionLoading(false)
    }
  }

  const applySuggestionsToOutline = async () => {
    if (!analysis || !outlineDeveloped || suggestionApplyLoading || suggestionsApplied) return
    setSuggestionApplyLoading(true)
    setSuggestionError('')
    try {
      const result = await askAi('/api/apply-suggestions', {
        transcript: reviewText,
        clarification,
        grade: gradeLevel,
        analysis,
      })
      setAnalysis(current => current ? {
        ...current,
        ideas: result.ideas.map((idea, index, allIdeas) => ({
          ...idea,
          section: normalizeOutlineSection(idea.section),
          answerNumber: allIdeas.slice(0, index + 1).filter(previous => normalizeOutlineSection(previous.section) === normalizeOutlineSection(idea.section)).length,
          id: window.crypto?.randomUUID?.() || `${Date.now()}-applied-${index}`,
        })),
      } : current)
      setSuggestionsApplied(true)
      setOutlineConfirmed(false)
      setEssay(null)
      setEssayHistory([])
    } catch (error) {
      setSuggestionError(error.message)
    } finally {
      setSuggestionApplyLoading(false)
    }
  }

  const changeOutlineSection = async section => {
    if (!analysis || !outlineDeveloped || analysis.inputMode !== 'prompt' || outlineChangingSection || outlineConfirmLoading) return
    const currentIdeas = analysis.ideas.filter(idea => normalizeOutlineSection(idea.section) === section)
    setOutlineChangingSection(section)
    setSuggestionError('')
    try {
      const previousVersions = outlineVersionHistory[section] || []
      const result = await askAi('/api/change-outline-section', {
        transcript: reviewText,
        grade: gradeLevel,
        analysis,
        section,
        previousVersions: [...previousVersions, currentIdeas.map(({ section: ideaSection, label, detail, source }) => ({ section: ideaSection, label, detail, source }))].slice(-6),
      })
      const replacement = result.ideas.map((idea, index) => ({
        ...idea,
        section,
        answerNumber: index + 1,
        source: 'example',
        id: window.crypto?.randomUUID?.() || `${Date.now()}-${section}-${index}`,
      }))
      if (!replacement.length) throw new Error('Chưa tạo được phương án mới cho phần này. Em thử lại nhé.')
      setAnalysis(current => {
        if (!current) return current
        const firstSectionIndex = current.ideas.findIndex(idea => normalizeOutlineSection(idea.section) === section)
        const keptIdeas = current.ideas.filter(idea => normalizeOutlineSection(idea.section) !== section)
        keptIdeas.splice(firstSectionIndex < 0 ? keptIdeas.length : firstSectionIndex, 0, ...replacement)
        return { ...current, ideas: keptIdeas }
      })
      setOutlineVersionHistory(history => ({
        ...history,
        [section]: [...previousVersions, currentIdeas.map(({ section: ideaSection, label, detail, source }) => ({ section: ideaSection, label, detail, source }))].slice(-6),
      }))
      setOutlineConfirmed(false)
      setSuggestionsApplied(false)
      setEssay(null)
      setEssayHistory([])
    } catch (error) {
      setSuggestionError(error.message)
    } finally {
      setOutlineChangingSection('')
    }
  }

  const confirmOutline = async () => {
    if (!analysis || analysis.inputMode !== 'prompt' || outlineConfirmLoading || outlineChangingSection) return
    setOutlineConfirmLoading(true)
    setSuggestionError('')
    try {
      const result = await askAi('/api/confirm-outline', {
        transcript: reviewText,
        grade: gradeLevel,
        analysis,
      })
      setAnalysis(current => current ? { ...current, questions: result.questions } : current)
      setOutlineConfirmed(true)
      setEssay(null)
      setEssayHistory([])
    } catch (error) {
      setSuggestionError(error.message)
    } finally {
      setOutlineConfirmLoading(false)
    }
  }

  const updateOutlineQuestion = (questionIndex, question) => {
    setAnalysis(current => current ? {
      ...current,
      outlineQuestions: current.outlineQuestions.map((item, index) => index === questionIndex ? { ...item, question } : item),
    } : current)
  }

  const deleteOutlineQuestion = questionIndex => {
    setAnalysis(current => current ? {
      ...current,
      outlineQuestions: current.outlineQuestions.filter((_, index) => index !== questionIndex),
    } : current)
    setOutlineDeveloped(false)
    setOutlineQuestionEditing({})
    setEssay(null)
  }

  const addOutlineQuestion = section => {
    if (analysis?.outlineQuestions?.length >= 15) return
    const question = section === 'Mở bài'
      ? 'Em muốn giới thiệu đề tài hoặc nhân vật bằng chi tiết nào?'
      : section === 'Kết bài'
        ? 'Sau khi viết xong, em muốn để lại suy nghĩ hoặc cảm xúc nào cho người đọc?'
        : 'Em có thể kể thêm chi tiết cụ thể nào để phần này sinh động hơn?'
    setAnalysis(current => current ? { ...current, outlineQuestions: [...current.outlineQuestions, { section, question }] } : current)
    setOutlineDeveloped(false)
    setEssay(null)
  }

  const closeEssay = () => {
    if (!essayOpen || essayClosing) return
    setEssayClosing(true)
    essayCloseTimerRef.current = window.setTimeout(() => {
      setEssayOpen(false)
      setEssayClosing(false)
      essayTriggerRef.current?.focus()
    }, 240)
  }

  const showEssay = async () => {
    window.clearTimeout(essayCloseTimerRef.current)
    setEssayClosing(false)
    setEssayOpen(true)
    if (essayLoading) return
    const nextVersion = essayVersion + 1
    const illustrationRequest = ++essayImageRequestRef.current
    setEssayVersion(nextVersion)
    setEssay(null)
    setEssayIllustration('')
    setEssayImageLoading(false)
    setEssaySaved(false)
    setEssayLoading(true)
    setEssayError('')
    try {
      const result = await askAi('/api/sample-essay', {
        transcript: reviewText,
        clarification,
        grade: gradeLevel,
        analysis,
        variant: nextVersion,
        previousEssays: essayHistory.slice(-2),
      }, 300_000)
      setEssay(result)
      setEssayHistory(history => [...history, result].slice(-3))
      setEssayImageLoading(true)
      askAi('/api/sample-essay/illustration', {
        transcript: reviewText,
        grade: gradeLevel,
        analysis,
        essay: result,
      }, 45_000, 2).then(imageResult => {
        if (essayImageRequestRef.current === illustrationRequest) setEssayIllustration(imageResult.illustrationData || '')
      }).catch(() => {
        if (essayImageRequestRef.current === illustrationRequest) setEssayIllustration('')
      }).finally(() => {
        if (essayImageRequestRef.current === illustrationRequest) setEssayImageLoading(false)
      })
    } catch (error) {
      setEssayError(error.message)
    } finally {
      setEssayLoading(false)
    }
  }

  const saveEssayToArchive = async () => {
    if (!essay || archiveSaving || essayImageLoading) return
    setArchiveSaving(true)
    const writingType = getWritingType(analysis?.writingTypeId, gradeLevel)
    const entry = {
      id: window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
      savedAt: new Date().toISOString(),
      title: essay.title,
      paragraphs: essay.paragraphs,
      grade: gradeLevel,
      writingTypeId: analysis?.writingTypeId || '',
      writingTypeLabel: writingType?.label || 'Dàn ý chung',
      groupLabel: writingType ? `Lớp ${gradeLevel} · ${writingType.groupLabel}` : `Bài viết Tiếng Việt lớp ${gradeLevel}`,
      ideas: analysis?.ideas?.map(({ section, label, detail, source }) => ({ section, label, detail, source })) || [],
      suggestion: analysis?.suggestion || '',
      questions: analysis?.questions || [],
    }
    try {
      await requestArchive('/api/archive/save', { entry, illustrationData: essayIllustration || undefined })
      await refreshSavedEssays({ showLoading: false })
      setEssaySaved(true)
      setArchiveError('')
    } catch (error) {
      setArchiveError(error.message || 'Chưa lưu được bài vào kho.')
    } finally {
      setArchiveSaving(false)
    }
  }

  const deleteSavedEssay = async id => {
    try {
      await requestArchive('/api/archive/delete', { id })
      await refreshSavedEssays({ showLoading: false })
      if (selectedSavedEssayId === id) setSelectedSavedEssayId(null)
      setArchiveError('')
    } catch (error) {
      setArchiveError(error.message || 'Chưa xóa được bài khỏi kho lưu trữ.')
    }
  }

  const changeGrade = grade => {
    const nextGrade = Number(grade) === 5 ? 5 : 4
    if (nextGrade === gradeLevel) { setTeacherMenuOpen(false); return }
    setGradeLevel(nextGrade)
    setTeacherMenuOpen(false)
    setAnalysis(null)
    setOutlineDeveloped(false)
    setScreen('capture')
    setAiError('')
    try { window.localStorage.setItem('voice-to-thought-grade', String(nextGrade)) } catch {}
  }

  const addOutlineIdea = section => {
    setOutlineConfirmed(false)
    setAnalysis(current => current ? {
      ...current,
      ideas: current.ideas.length >= 12 ? current.ideas : [...current.ideas, { id: window.crypto?.randomUUID?.() || `${Date.now()}-new`, section, label: '', detail: '', source: 'provided' }],
    } : current)
  }

  const removeOutlineIdea = id => {
    setOutlineConfirmed(false)
    setAnalysis(current => current ? { ...current, ideas: current.ideas.filter(idea => idea.id !== id) } : current)
    if (editingIdeaId === id) setEditingIdeaId(null)
  }

  const saveOutlineIdea = id => {
    const content = editDraft.trim()
    if (!content) return
    setOutlineConfirmed(false)
    setAnalysis(current => current ? {
      ...current,
      ideas: current.ideas.map(idea => idea.id === id ? { ...idea, label: '', detail: content, source: 'provided' } : idea),
    } : current)
    setEditingIdeaId(null)
    setEditDraft('')
  }

  const moveOutlineIdea = (sourceId, targetId, targetSection, insertAfter = false) => {
    if (!sourceId) return
    setOutlineConfirmed(false)
    setAnalysis(current => {
      if (!current) return current
      const sourceIndex = current.ideas.findIndex(idea => idea.id === sourceId)
      if (sourceIndex < 0) return current
      const ideas = [...current.ideas]
      const [source] = ideas.splice(sourceIndex, 1)
      if (source.id === targetId) return current
      const moving = { ...source, section: targetSection }
      let targetIndex = targetId ? ideas.findIndex(idea => idea.id === targetId) : -1
      if (targetIndex >= 0) {
        if (insertAfter) targetIndex += 1
      } else {
        const sameSection = ideas.reduce((indices, idea, index) => idea.section === targetSection ? [...indices, index] : indices, [])
        targetIndex = sameSection.length ? sameSection[sameSection.length - 1] + 1 : ideas.length
      }
      ideas.splice(targetIndex, 0, moving)
      if (ideas.every((idea, index) => idea.id === current.ideas[index]?.id && idea.section === current.ideas[index]?.section)) return current
      return { ...current, ideas }
    })
  }

  const openProjection = () => {
    setProjectionKind('outline')
    setProjectionView('all')
    setProjectionSectionIndex(0)
    setProjectionOpen(true)
  }

  const openEssayProjection = () => {
    setProjectionKind('essay')
    setProjectionView('all')
    setProjectionSectionIndex(0)
    setProjectionOpen(true)
  }

  const openArchive = () => {
    setSelectedSavedEssayId(null)
    setArchiveError('')
    setArchiveOpen(true)
    refreshSavedEssays()
  }

  const closeArchive = () => {
    setArchiveOpen(false)
    window.setTimeout(() => archiveTriggerRef.current?.focus(), 0)
  }

  const closeProjection = () => {
    setProjectionOpen(false)
    window.setTimeout(() => (projectionKind === 'essay' ? essayProjectionTriggerRef.current : projectionTriggerRef.current)?.focus(), 0)
  }

  const projectionSections = groupIdeasBySection(analysis?.ideas)
  const selectedWritingType = getWritingType(analysis?.writingTypeId, gradeLevel)
  const hasExampleOutlineIdeas = Boolean(analysis?.ideas?.some(idea => idea.source === 'example'))
  const hasProvidedOutlineIdeas = Boolean(analysis?.ideas?.some(idea => idea.source !== 'example'))
  const isPromptOnly = analysis?.inputMode === 'prompt'

  useEffect(() => {
    if (!projectionOpen) return undefined
    const handleKeyDown = event => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeProjection()
      }
      if (event.key === 'Tab' && projectionKind === 'outline') {
        const focusable = document.querySelector('.projection-screen')?.querySelectorAll('button:not(:disabled)')
        if (!focusable?.length) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
      if (projectionKind !== 'outline' || projectionView !== 'section') return
      const lastIndex = projectionSections.length - 1
      if (event.key === 'ArrowLeft') setProjectionSectionIndex(index => Math.max(index - 1, 0))
      if (event.key === 'ArrowRight') setProjectionSectionIndex(index => Math.min(index + 1, lastIndex))
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    projectionContentRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = essayOpen ? 'hidden' : ''
    }
  }, [projectionOpen, projectionView, projectionSections.length, projectionKind, essayOpen])

  useEffect(() => {
    if (!archiveOpen) return undefined
    window.setTimeout(() => archiveDialogRef.current?.querySelector('button:not(:disabled)')?.focus(), 0)
    const handleKeyDown = event => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeArchive()
      }
      if (event.key !== 'Tab') return
      const focusable = archiveDialogRef.current?.querySelectorAll('button:not(:disabled)')
      if (!focusable?.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [archiveOpen])

  useEffect(() => {
    if (!essayOpen || projectionOpen) return undefined
    const handleKeyDown = event => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeEssay()
      }
      if (event.key !== 'Tab') return
      const focusable = essayDialogRef.current?.querySelectorAll('button:not(:disabled)')
      if (!focusable?.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    essayCloseButtonRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = projectionOpen ? 'hidden' : ''
    }
  }, [essayOpen, essayClosing, projectionOpen])

  const reset = () => {
    window.clearTimeout(essayCloseTimerRef.current)
    setTranscript('')
    setHasRecordedSpeech(false)
    setReviewText('')
    setRemovedWords(0)
    setAnalysis(null)
    setOutlineDeveloped(false)
    setOutlineDevelopLoading(false)
    setOutlineQuestionEditing({})
    setSuggestionHistory([])
    setSuggestionError('')
    setSuggestionLoading(false)
    setEssay(null)
    setEssayHistory([])
    setEssayVersion(0)
    setEssayError('')
    setEssayLoading(false)
    setEssayOpen(false)
    setEssayClosing(false)
    setAiNote('')
    setClarificationQuestion('')
    setClarification('')
    setAiError('')
    setWorking(false)
    setElapsed(0)
    setScreen('capture')
  }

  if (!accessChecked) return <main className="access-screen"><div className="access-card access-waiting"><span className="essay-loader"/> Đang mở ứng dụng…</div></main>
  if (!accessGranted) return <AccessGate onLogin={() => setAccessGranted(true)} />

  const essayModal = essayOpen && createPortal(<div className={`essay-backdrop${essayClosing ? ' is-closing' : ''}`} onMouseDown={event => { if (event.target === event.currentTarget) closeEssay() }}>
    <section className="essay-dialog" ref={essayDialogRef} role="dialog" aria-modal="true" aria-labelledby="essay-title" aria-describedby="essay-description">
      <button className="essay-close" ref={essayCloseButtonRef} onClick={closeEssay} aria-label="Đóng bài văn mẫu"><X size={23}/></button>
      <div className="essay-dialog-heading"><span className="essay-book-icon"><BookOpen size={25}/></span><p className="eyebrow">GỢI Ý DÀNH CHO GIÁO VIÊN</p><h2 id="essay-title">Bài văn mẫu</h2><p id="essay-description">Mỗi lần mở, AI sẽ viết một phiên bản mới theo gợi ý hiện tại.</p>{essay && <div className="essay-dialog-actions"><button className={`essay-save-button${essaySaved ? ' is-saved' : ''}`} onClick={saveEssayToArchive} disabled={essaySaved || archiveSaving || essayImageLoading}>{essaySaved ? <BookmarkCheck size={19}/> : <BookmarkPlus size={19}/>} {essaySaved ? 'Đã lưu vào kho' : essayImageLoading ? 'Đang vẽ hình…' : archiveSaving ? 'Đang lưu…' : 'Lưu'}</button><button className="essay-project-button" ref={essayProjectionTriggerRef} onClick={openEssayProjection}><Presentation size={20}/> Chiếu bài văn mẫu</button></div>}{archiveError && <p className="archive-inline-error" role="alert">{archiveError}</p>}</div>
      {essayLoading && <div className="essay-loading" role="status"><span className="essay-loader"/> AI đang viết bài mẫu…</div>}
      {essayError && <div className="essay-error" role="alert"><p>{essayError}</p><button onClick={showEssay}>Thử lại</button></div>}
      {essay && <article className="essay-content"><h3>{essay.title}</h3>{essayImageLoading && !essayIllustration && <div className="essay-illustration-placeholder" role="status"><span className="essay-loader"/> Đang chuẩn bị hình minh họa…</div>}{essayIllustration && <figure className="essay-illustration"><img src={essayIllustration} alt={`Hình minh họa cho bài ${essay.title}`} /><figcaption>Hình minh họa cho bài văn</figcaption></figure>}{essay.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</article>}
      <p className="essay-footer">Cảm xúc và suy nghĩ thêm là gợi ý để cô và các bạn lựa chọn, chỉnh lại cho đúng với mình.</p>
    </section>
  </div>, document.body)

  const selectedSavedEssay = savedEssays.find(item => item.id === selectedSavedEssayId)
  const savedEssayGroups = selectedSavedEssay ? groupIdeasBySection(selectedSavedEssay.ideas) : []
  const archiveModal = archiveOpen && createPortal(<div className="archive-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) closeArchive() }}>
    <section className="archive-dialog" ref={archiveDialogRef} role="dialog" aria-modal="true" aria-labelledby="archive-title">
      <header className="archive-heading"><div><span className="archive-heading-icon"><Archive size={23}/></span><div><p className="eyebrow">CÔ THÚY AN · KHO CHUNG</p><h2 id="archive-title">Kho lưu trữ</h2></div></div><button className="essay-close" onClick={closeArchive} aria-label="Đóng kho lưu trữ"><X size={22}/></button></header>
      {archiveError && <p className="archive-inline-error" role="alert">{archiveError}</p>}
      {selectedSavedEssay
        ? <div className="archive-detail">
          <button className="archive-back" onClick={() => setSelectedSavedEssayId(null)}><ArrowLeft size={17}/> Tất cả bài đã lưu</button>
          <div className="archive-meta"><span>{selectedSavedEssay.groupLabel} · {selectedSavedEssay.writingTypeLabel}</span><time>{new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(new Date(selectedSavedEssay.savedAt))}</time></div>
          <article className="essay-content"><h3>{selectedSavedEssay.title}</h3>{selectedSavedEssay.illustrationUrl && <figure className="essay-illustration"><img src={selectedSavedEssay.illustrationUrl} alt={`Hình minh họa cho bài ${selectedSavedEssay.title}`} /><figcaption>Hình minh họa cho bài văn</figcaption></figure>}{selectedSavedEssay.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</article>
          <section className="archive-context"><h3>Dàn ý đã lưu</h3>{savedEssayGroups.map(group => <div className="archive-outline-section" key={group.section}><h4>{group.section}</h4>{group.ideas.length ? <ul>{group.ideas.map((idea, index) => <li key={`${group.section}-${index}`}>{idea.source === 'example' && <span className="outline-source-tag">Gợi ý tham khảo</span>}{getIdeaText(idea)}</li>)}</ul> : <p>Chưa có ý ở phần này.</p>}</div>)}
            <div className="archive-prompt"><h4>Một bước nhỏ</h4><p>{selectedSavedEssay.suggestion || 'Chưa có gợi ý được lưu.'}</p></div>
            <div className="archive-prompt"><h4>Câu hỏi gợi mở</h4><ul>{selectedSavedEssay.questions.map((question, index) => <li key={index}>{question}</li>)}</ul></div>
          </section>
          <button className="archive-delete-detail" onClick={() => deleteSavedEssay(selectedSavedEssay.id)}><Trash2 size={17}/> Xóa bài này khỏi kho</button>
        </div>
        : archiveLoading
          ? <div className="archive-empty"><span className="essay-loader"/><p>Đang tải kho lưu trữ…</p></div>
          : savedEssays.length
          ? <div className="archive-list">{savedEssays.map(item => <article className="archive-entry" key={item.id}><button className="archive-entry-open" onClick={() => setSelectedSavedEssayId(item.id)}><span className="archive-entry-title">{item.title}</span><span className="archive-entry-type">{item.writingTypeLabel}</span><span className="archive-entry-date">Đã lưu {new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(new Date(item.savedAt))}</span></button><button className="archive-delete-button" onClick={() => deleteSavedEssay(item.id)} aria-label={`Xóa bài ${item.title}`}><Trash2 size={18}/></button></article>)}</div>
          : <div className="archive-empty"><BookmarkPlus size={35}/><p>Chưa có bài văn nào được lưu.</p><span>Mở một bài văn mẫu rồi bấm “Lưu” để cất vào đây.</span></div>}
    </section>
  </div>, document.body)

  return <>
  <main className="app-shell">
    <header className="topbar">
      <div className="brand"><div className="brand-mark" aria-hidden="true"><AudioLines className="logo-voice" size={17}/><ArrowRight className="logo-arrow" size={12}/><Lightbulb className="logo-thought" size={18}/></div><div className="brand-copy"><span>Voice to Thought</span><small>Ứng dụng chuyển Ý tưởng thành Dàn ý</small></div></div>
      <div className="teacher-menu" ref={teacherMenuRef}>
        <button className="class-chip" ref={archiveTriggerRef} onClick={() => setTeacherMenuOpen(value => !value)} aria-haspopup="menu" aria-expanded={teacherMenuOpen} aria-label={`Cô Thúy An, Lớp ${gradeLevel}. Mở cài đặt lớp`}><span/> Cô Thúy An · Lớp {gradeLevel} <ChevronDown size={15}/></button>
        <div className={`teacher-menu-popover${teacherMenuOpen ? ' is-open' : ''}`} role="menu">
          <p className="teacher-menu-label">LỚP ĐANG DẠY</p>
          {[4, 5].map(grade => <button key={grade} className="teacher-grade-option" role="menuitemradio" aria-checked={gradeLevel === grade} onClick={() => changeGrade(grade)}><GraduationCap size={17}/><span>Lớp {grade}</span>{gradeLevel === grade && <Check size={17}/>}</button>)}
          <div className="teacher-menu-divider"/>
          <button onClick={() => { setTeacherMenuOpen(false); openArchive() }}><Archive size={17}/><span>Kho lưu trữ</span><b>{savedEssays.length}</b></button>
        </div>
      </div>
    </header>
    <div className="classroom-doodles" aria-hidden="true"><span className="doodle-book">📚</span><span className="doodle-pencil">✏️</span><span className="doodle-star doodle-star-one">✦</span><span className="doodle-star doodle-star-two">✧</span><span className="doodle-flower">✿</span></div>

    {screen === 'capture' && <section className="capture-screen">
      <div className="intro"><div className="sun-doodle">✳</div><p className="eyebrow">XIN CHÀO CÁC BẠN HỌC SINH</p><h1>Bạn đang nghĩ gì<br/>thế nhỉ?</h1><p className="intro-help">Em có thể kể ý tưởng, nhập đề bài,<br/>hoặc làm cả hai nhé.</p><div className="teacher-context"><GraduationCap size={17}/> Tiếng Việt lớp {gradeLevel}</div></div>

      <div className={`recorder ${recording ? 'is-recording' : ''}`}>
        <div className="record-orbit orbit-one"/><div className="record-orbit orbit-two"/>
        <button className="record-button" onClick={recording ? stopRecording : startRecording} aria-label={recording ? 'Dừng ghi âm' : 'Bắt đầu ghi âm'}>
          {recording ? <Pause size={32} fill="currentColor"/> : <Mic size={34} fill="currentColor"/>}
        </button>
        <strong>{recording ? 'Em đang kể, mình đang nghe!' : 'Chạm để bắt đầu ghi âm'}</strong>
        <span>{recording ? formatTime(elapsed) : 'Tiếng Việt · Nói thật tự nhiên nhé'}</span>
      </div>

      <div className="transcript-card">
        <div className="transcript-head"><div className="transcript-icon"><Volume2 size={19}/></div><div><strong>Đề bài và ý tưởng của em</strong><span>{recording ? 'Đang chuyển lời nói thành chữ…' : 'Nói hoặc nhập nội dung vào đây'}</span></div>{transcript && <button className="clear-button" onClick={reset} aria-label="Xóa và bắt đầu lại"><RotateCcw size={16}/></button>}</div>
        <textarea ref={transcriptTextareaRef} value={transcript} onChange={event => { setTranscript(event.target.value); setAnalysis(null); setOutlineDeveloped(false) }} placeholder="Ví dụ: Viết bài văn tả phong cảnh. Em muốn tả bãi biển em đến cùng gia đình…" aria-label="Đề bài và ý tưởng của em" />
        <div className="transcript-foot"><span>{transcript.trim() ? `${transcript.trim().split(/\s+/).length} từ` : 'Em có thể nhập đề bài hoặc kể suy nghĩ của mình'}</span>{recording && <span className="listening"><i/> Đang nghe</span>}</div>
      </div>

      <button className="analyze-button" disabled={!transcript.trim() || recording || working} onClick={openAnalysis}><Sparkles size={21}/> {working ? 'AI đang đọc nội dung…' : 'Lập dàn ý'} {!working && <ArrowRight size={20}/>}</button>
      {aiError && <p className="ai-message ai-error" role="alert">{aiError}</p>}
      <p className="gentle-reminder">Ý tưởng nào cũng đáng được lắng nghe <span>✿</span></p><p className="app-credit">Ứng dụng này được xây dựng và phát triển bởi cô Thúy An</p>
    </section>}

    {screen === 'review' && <section className="review-screen">
      <button className="back-button" onClick={() => setScreen('capture')}><ArrowLeft size={19}/> Quay lại lời kể</button>
      <div className="review-title"><div className="sparkle-badge"><Sparkles size={22}/></div><p className="eyebrow">NGHE LẠI</p><h1>Mình nghe đúng ý bạn chưa?</h1><p>Đọc lại lời gốc và sửa bản gợi ý nếu cần nhé.</p></div>
      <div className="review-comparison">
        <article className="spoken-original"><span><Volume2 size={15}/> LỜI GỐC CỦA EM</span><p>{transcript}</p></article>
        <div className="review-arrow" aria-hidden="true"><ArrowRight size={25}/></div>
        <label className="review-edit"><span><span><Sparkles size={15}/> BẢN GỢI Ý TỪ AI</span><small>Em có thể sửa hoặc thêm ý để đúng với điều mình muốn nói.</small></span><textarea ref={reviewTextareaRef} value={reviewText} onChange={event => setReviewText(event.target.value)} aria-label="Chỉnh sửa bản gợi ý" /></label>
      </div>
      <p className="review-note">{aiNote || (removedWords > 0 ? `Mình đã gọn hóa ${removedWords} từ lặp hoặc từ đệm. Em kiểm tra lại xem ý đã đúng chưa nhé.` : 'Mình chưa thấy từ lặp rõ ràng nên giữ gần nguyên lời em nói. Em sửa lại nếu cần nhé.')}</p>
      {clarificationQuestion && <label className="clarification-box"><span>{clarificationQuestion}</span><textarea value={clarification} onChange={event => setClarification(event.target.value)} placeholder="Em viết thêm một chút nhé…" aria-label="Trả lời câu hỏi làm rõ" /></label>}
      {aiError && <p className="ai-message ai-error" role="alert">{aiError}</p>}
      <button className="analyze-button" disabled={!reviewText.trim() || working || (Boolean(clarificationQuestion) && !clarification.trim())} onClick={confirmTranscript}><Check size={20}/> {working ? 'AI đang sắp xếp ý…' : 'Đúng rồi, phân tích nhé'} {!working && <ArrowRight size={20}/>}</button>
      <button className="keep-original" onClick={() => setReviewText(transcript)}>Dùng nguyên văn lời gốc</button>
      <p className="app-credit">Ứng dụng này được xây dựng và phát triển bởi cô Thúy An</p>
    </section>}

    {screen === 'results' && analysis && <section className="results-screen">
      <button className="back-button" onClick={() => setScreen(hasRecordedSpeech ? 'review' : 'capture')}><ArrowLeft size={19}/> {hasRecordedSpeech ? 'Xem lại lời đã sửa' : 'Sửa đề bài và ý tưởng'}</button>
      <div className="results-title"><div className="sparkle-badge"><Sparkles size={24}/></div><p className="eyebrow">AI CÙNG MÌNH SẮP XẾP Ý</p><h1>Ý tưởng của em<br/>đang lớn lên!</h1><p>{selectedWritingType ? `AI nhận diện: ${selectedWritingType.label}` : 'Đây là vài điều mình nghe được từ em.'}</p></div>
      {outlineDeveloped && <div className="outline-actions">
        <button className="outline-edit-button" onClick={() => { setOutlineEditing(value => !value); setEditingIdeaId(null) }}><Pencil size={19}/>{outlineEditing ? 'Xong phần chỉnh sửa' : 'Sửa dàn ý'}</button>
        <button className="projection-button" ref={projectionTriggerRef} onClick={openProjection}><Presentation size={20}/>Chiếu dàn ý</button>
      </div>}
      <article className="result-card ideas-card"><div className="result-heading"><span className="result-icon idea-icon"><Lightbulb size={22}/></span><div><span className="card-kicker">ĐIỀU EM ĐANG NGHĨ</span><h2>{selectedWritingType?.label || 'Dàn ý bài viết'}</h2></div><span className="card-number">01</span></div>
        {!outlineDeveloped && <div className="outline-develop-row"><p>Đọc các câu hỏi bên trái. Khi đã thấy phù hợp, bấm nút để AI lần lượt trả lời và triển khai thành dàn ý cụ thể.</p><button className="outline-develop-button" onClick={developOutline} disabled={outlineDevelopLoading || Object.values(outlineQuestionEditing).some(Boolean) || analysis.outlineQuestions.some(item => !item.question.trim())}><Sparkles size={19}/>{outlineDevelopLoading ? 'AI đang triển khai dàn ý…' : 'Triển khai dàn ý'}</button></div>}
        <div className={`outline-columns${outlineDeveloped ? ' is-developed' : ''}`}>
          <div className="outline-question-column"><h3 className="outline-column-title">Câu hỏi gợi ý</h3>{groupIdeasBySection(analysis.outlineQuestions.map((item, index) => ({ section: item.section, label: '', detail: item.question, id: `question-${index}`, questionIndex: index }))).map(group => <section className={`outline-panel ${group.section === 'Mở bài' ? 'opening' : group.section === 'Kết bài' ? 'closing' : 'body'}`} key={group.section}><div className="outline-question-section-heading"><h3>{group.section}</h3><button className="outline-question-edit-button" onClick={() => { setOutlineQuestionEditing(current => ({ ...current, [group.section]: !current[group.section] })); setOutlineDeveloped(false); setOutlineConfirmed(false); setEssay(null) }}><Pencil size={14}/>{outlineQuestionEditing[group.section] ? 'Xong' : 'Chỉnh sửa'}</button></div><ol className="outline-question-list">{group.ideas.map((item, index) => <li key={item.id}><span className="outline-question-number">{index + 1}</span>{outlineQuestionEditing[group.section] ? <><textarea className="outline-question-editor" value={analysis.outlineQuestions[item.questionIndex].question} onChange={event => updateOutlineQuestion(item.questionIndex, event.target.value)} aria-label={`Chỉnh sửa câu hỏi ${index + 1}, phần ${group.section}`}/><button className="outline-question-delete-button" onClick={() => deleteOutlineQuestion(item.questionIndex)} disabled={analysis.outlineQuestions.length <= 1} aria-label={`Xóa câu hỏi ${index + 1}`} title="Xóa câu hỏi"><Trash2 size={16}/></button></> : <span className="outline-question-text">{item.detail}</span>}</li>)}</ol>{outlineQuestionEditing[group.section] && <button className="outline-question-add-button" onClick={() => addOutlineQuestion(group.section)} disabled={analysis.outlineQuestions.length >= 15}><Plus size={15}/>Thêm câu hỏi</button>}</section>)}</div>
          <div className="outline-answer-column"><h3 className="outline-column-title">Dàn ý được triển khai</h3>{!outlineDeveloped ? <div className="outline-answer-placeholder"><Sparkles size={25}/><p>Câu trả lời của AI sẽ xuất hiện ở đây sau khi em bấm “Triển khai dàn ý”.</p></div> : groupIdeasBySection(analysis.ideas).map(group => <section
          className={`outline-panel ${group.section === 'Mở bài' ? 'opening' : group.section === 'Kết bài' ? 'closing' : 'body'}`}
          key={group.section}
          onDragOver={event => {
            if (!outlineEditing || !draggedIdeaId) return
            event.preventDefault()
            event.dataTransfer.dropEffect = 'move'
            setDropTarget({ section: group.section, id: null, position: 'end' })
            moveOutlineIdea(draggedIdeaId, null, group.section)
          }}
          onDrop={event => { event.preventDefault(); if (outlineEditing) moveOutlineIdea(draggedIdeaId, null, group.section) }}
        >
          <h3>{group.section}</h3>
          <ul>{group.ideas.length === 0 && <li className="outline-empty">Chưa có ý ở phần này.</li>}{group.ideas.map((idea, ideaIndex) => <li
            key={idea.id}
            className={`${draggedIdeaId === idea.id ? 'is-dragging ' : ''}${dropTarget?.id === idea.id && dropTarget?.position === 'before' ? 'drop-before ' : ''}${dropTarget?.id === idea.id && dropTarget?.position === 'after' ? 'drop-after' : ''}`.trim()}
            onDragOver={event => {
              if (!outlineEditing || !draggedIdeaId) return
              event.preventDefault()
              event.stopPropagation()
              event.dataTransfer.dropEffect = 'move'
              const rect = event.currentTarget.getBoundingClientRect()
              const position = event.clientY >= rect.top + rect.height / 2 ? 'after' : 'before'
              setDropTarget(current => current?.id === idea.id && current?.position === position ? current : { section: group.section, id: idea.id, position })
              moveOutlineIdea(draggedIdeaId, idea.id, group.section, position === 'after')
            }}
            onDrop={event => {
              event.preventDefault()
              event.stopPropagation()
              if (outlineEditing) moveOutlineIdea(draggedIdeaId, idea.id, group.section, dropTarget?.id === idea.id && dropTarget?.position === 'after')
            }}
          >
            {outlineEditing && editingIdeaId === idea.id
              ? <textarea className="outline-inline-editor" value={editDraft} onChange={event => setEditDraft(event.target.value)} aria-label={`Chỉnh sửa ý trong phần ${group.section}`} autoFocus />
              : <><span className="outline-answer-number" aria-label={`Câu hỏi ${idea.answerNumber || ideaIndex + 1}`}>{idea.answerNumber || ideaIndex + 1}</span><span className="outline-idea-text">{idea.source === 'example' && <span className="outline-source-tag">Gợi ý tham khảo</span>}{getIdeaText(idea) || 'Bấm cây bút để viết ý này.'}</span></>}
            {outlineEditing && <div className="outline-item-actions">
              {editingIdeaId === idea.id
                ? <><button className="outline-item-action save" onClick={() => saveOutlineIdea(idea.id)} aria-label="Lưu ý"><Check size={19}/></button><button className="outline-item-action cancel" onClick={() => { setEditingIdeaId(null); setEditDraft('') }} aria-label="Hủy chỉnh sửa"><X size={19}/></button></>
                : <button className="outline-item-action edit" onClick={() => { setEditingIdeaId(idea.id); setEditDraft(getIdeaText(idea)) }} aria-label="Sửa ý"><Pencil size={18}/></button>}
              <button className="outline-item-action delete" onClick={() => removeOutlineIdea(idea.id)} disabled={analysis.ideas.length <= 1} aria-label="Xóa ý"><Trash2 size={18}/></button>
              <button className="outline-item-action drag" draggable onDragStart={event => {
                event.dataTransfer.effectAllowed = 'move'
                event.dataTransfer.setData('text/plain', idea.id)
                const row = event.currentTarget.closest('li')
                const rect = row?.getBoundingClientRect()
                if (row && rect) event.dataTransfer.setDragImage(row, event.clientX - rect.left, event.clientY - rect.top)
                setDraggedIdeaId(idea.id)
                setDropTarget(null)
              }} onDragEnd={() => { setDraggedIdeaId(null); setDropTarget(null) }} aria-label="Kéo để đổi thứ tự" title="Kéo để đổi thứ tự"><GripVertical size={20}/></button>
            </div>}
          </li>)}</ul>
          {isPromptOnly && <button className="outline-change-button" onClick={() => changeOutlineSection(group.section)} disabled={Boolean(outlineChangingSection) || outlineConfirmLoading || suggestionApplyLoading}><Sparkles size={17}/>{outlineChangingSection === group.section ? 'Đang thay đổi…' : 'Thay đổi'}</button>}
          {outlineEditing && <button className="outline-add-button" onClick={() => addOutlineIdea(group.section)} disabled={analysis.ideas.length >= 12}><Plus size={17}/> Thêm ý</button>}
        </section>)}</div>
        </div>
      </article>
      {outlineDeveloped && <><p className="outline-source-note">{hasExampleOutlineIdeas ? 'Các ý có nhãn “Gợi ý tham khảo” là ví dụ AI đề xuất để em chọn, sửa hoặc bỏ. Hãy giữ những chi tiết đúng với ý của em.' : suggestionsApplied ? 'Dàn ý đã được cập nhật bằng những gợi ý em chọn.' : hasProvidedOutlineIdeas ? 'Dàn ý giữ nguyên ý và trình tự em kể; gợi ý bên dưới chưa được đưa vào.' : 'Dàn ý giữ các ý em đã cung cấp.'}</p>
      {isPromptOnly && <div className="outline-confirm-row"><p>{outlineConfirmed ? 'Câu hỏi gợi mở đã được điều chỉnh theo dàn ý này.' : 'Khi đã đồng ý với dàn ý, xác nhận để câu hỏi gợi mở bên dưới bổ sung phù hợp nhé.'}</p><button className={`outline-confirm-button${outlineConfirmed ? ' is-confirmed' : ''}`} onClick={confirmOutline} disabled={outlineConfirmLoading || Boolean(outlineChangingSection) || suggestionApplyLoading}>{outlineConfirmLoading ? 'Đang xác nhận…' : outlineConfirmed ? 'Đã xác nhận' : 'Xác nhận'}</button></div>}</>}
      <article className="result-card suggestion-card"><div className="result-heading"><span className="result-icon suggestion-icon"><Sparkles size={21}/></span><div><span className="card-kicker">MỘT BƯỚC NHỎ</span><h2>Gợi ý</h2></div><span className="card-number">02</span></div><p>{analysis.suggestion}</p></article>
      <article className="result-card questions-card"><div className="result-heading"><span className="result-icon question-icon">?</span><div><span className="card-kicker">CÙNG TÒ MÒ NÀO</span><h2>Câu hỏi gợi mở</h2></div><span className="card-number">03</span></div><ul>{analysis.questions.map((question, index) => <li key={index}><span className="question-bubble">?</span>{question}</li>)}</ul></article>
      {suggestionError && <p className="ai-message ai-error suggestion-error" role="alert">{suggestionError}</p>}
      <div className="suggestion-actions">
        <button className="alternative-suggestion-button" onClick={generateAlternativeSuggestion} disabled={suggestionLoading || suggestionApplyLoading}><Sparkles size={20}/> {suggestionLoading ? 'AI đang nghĩ thêm…' : 'Gợi ý khác'}</button>
        <button className={`apply-suggestions-button${suggestionsApplied ? ' is-applied' : ''}`} onClick={applySuggestionsToOutline} disabled={!outlineDeveloped || suggestionApplyLoading || suggestionsApplied}><Check size={20}/> {suggestionApplyLoading ? 'AI đang cập nhật dàn ý…' : suggestionsApplied ? 'Đã đưa gợi ý vào dàn ý' : 'Đưa gợi ý vào dàn ý'}</button>
      </div>
      <p className="suggestion-help">Chỉ những gợi ý em đồng ý mới được đưa vào dàn ý.</p>
      <div className="sample-actions">
        <button className="essay-button" ref={essayTriggerRef} onClick={showEssay} disabled={!outlineDeveloped}><BookOpen size={21}/> {outlineDeveloped ? 'Gợi ý bài văn mẫu' : 'Triển khai dàn ý trước nhé'}</button>
      </div>
      <p className="essay-teacher-note">Giáo viên có thể mở khi thấy phù hợp.</p>
      <button className="again-button" onClick={reset}><RotateCcw size={18}/> Kể một ý tưởng khác</button>
      <p className="gentle-reminder">Ý tưởng nào cũng đáng được lắng nghe <span>✿</span></p><p className="app-credit">Ứng dụng này được xây dựng và phát triển bởi cô Thúy An</p>
    </section>}

  </main>
  {essayModal}
  {archiveModal}
  {projectionOpen && createPortal(<div className="projection-backdrop" role="dialog" aria-modal="true" aria-label={projectionKind === 'essay' ? 'Trình chiếu bài văn mẫu' : 'Trình chiếu dàn ý'} onMouseDown={event => { if (event.target === event.currentTarget) closeProjection() }}>
    <section className={`projection-screen${projectionKind === 'essay' ? ' essay-projection-screen' : ''}`}>
      {projectionKind === 'essay'
        ? <main className="essay-project-slide" ref={projectionContentRef} tabIndex={-1}><h1>{essay?.title || 'Bài văn mẫu'}</h1>{essayIllustration && <img className="essay-projection-illustration" src={essayIllustration} alt={`Hình minh họa cho bài ${essay?.title || 'văn mẫu'}`} />}<article>{essay?.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</article></main>
        : <>
          <div className="projection-mode-switch" role="group" aria-label="Cách trình chiếu dàn ý"><button className={projectionView === 'all' ? 'is-active' : ''} onClick={() => setProjectionView('all')}>Toàn dàn ý</button><button className={projectionView === 'section' ? 'is-active' : ''} onClick={() => setProjectionView('section')}>Từng phần</button></div>
          <div className="projection-content" ref={projectionContentRef} tabIndex={-1}>
            {(projectionView === 'all' ? projectionSections : [projectionSections[projectionSectionIndex]].filter(Boolean)).map(group => <article className={`projection-section ${group.section === 'Mở bài' ? 'opening' : group.section === 'Kết bài' ? 'closing' : 'body'}`} key={group.section}><h2>{group.section}</h2>{group.ideas.length ? <ul>{group.ideas.map(idea => <li key={idea.id}>{idea.source === 'example' && <span className="outline-source-tag">Gợi ý tham khảo</span>}{getIdeaText(idea)}</li>)}</ul> : <p className="projection-empty">Chưa có ý ở phần này.</p>}</article>)}
          </div>
          {projectionView === 'section' && projectionSections.length > 0 && <nav className="projection-pagination projection-arrow-controls" aria-label="Chuyển phần dàn ý"><button onClick={() => setProjectionSectionIndex(index => Math.max(0, index - 1))} disabled={projectionSectionIndex === 0} aria-label="Phần trước"><ChevronLeft size={26}/></button><button onClick={() => setProjectionSectionIndex(index => Math.min(projectionSections.length - 1, index + 1))} disabled={projectionSectionIndex >= projectionSections.length - 1} aria-label="Phần tiếp"><ChevronRight size={26}/></button></nav>}
        </>}
    </section>
  </div>, document.body)}
  </>
}

createRoot(document.getElementById('root')).render(<App />)
