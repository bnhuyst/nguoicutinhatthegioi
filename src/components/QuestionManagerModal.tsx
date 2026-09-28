import React, { useState, useMemo } from 'react';
import { Question } from '../types';
import { 
  getCategories, 
  createQuestion, 
  updateQuestion, 
  deleteQuestion, 
  resetDefaultQuestions 
} from '../utils/storage';
import { 
  X, Plus, Edit2, Trash2, RotateCcw, 
  CheckCircle2, Lightbulb, 
  FolderCheck, Search, BookOpen
} from 'lucide-react';
import { sound } from '../utils/sound';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  onQuestionsChange: (newQuestions: Question[]) => void;
}

export const QuestionManagerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  questions,
  onQuestionsChange,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states
  const [formCategory, setFormCategory] = useState<string>('Đố vui đố mẹo');
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [formPrompt, setFormPrompt] = useState<string>('');
  const [formOptions, setFormOptions] = useState<[string, string, string, string]>([
    '', '', '', ''
  ]);
  const [formCorrectIndex, setFormCorrectIndex] = useState<number>(0);
  const [formHint, setFormHint] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  const categories = useMemo(() => getCategories(questions), [questions]);

  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      const matchCat = selectedCategory === 'ALL' || q.category === selectedCategory;
      const matchKey = searchKeyword.trim() === '' || 
        q.prompt.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        q.options.some(opt => opt.toLowerCase().includes(searchKeyword.toLowerCase()));
      return matchCat && matchKey;
    });
  }, [questions, selectedCategory, searchKeyword]);

  if (!isOpen) return null;

  const handleStartCreate = () => {
    sound.playShootNormal();
    setIsCreating(true);
    setEditingQuestion(null);
    setFormCategory(categories[0] || 'Đố vui đố mẹo');
    setNewCategoryName('');
    setFormPrompt('');
    setFormOptions(['', '', '', '']);
    setFormCorrectIndex(0);
    setFormHint('');
    setFormError('');
  };

  const handleStartEdit = (q: Question) => {
    sound.playShootNormal();
    setIsCreating(false);
    setEditingQuestion(q);
    setFormCategory(q.category);
    setNewCategoryName('');
    setFormPrompt(q.prompt);
    setFormOptions([...q.options] as [string, string, string, string]);
    setFormCorrectIndex(q.correctIndex);
    setFormHint(q.hint || '');
    setFormError('');
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPrompt.trim()) {
      setFormError('Vui lòng nhập nội dung câu hỏi!');
      return;
    }
    if (formOptions.some(opt => !opt.trim())) {
      setFormError('Vui lòng điền đầy đủ cả 4 đáp án A, B, C, D!');
      return;
    }
    const finalCategory = formCategory === '__NEW__' ? newCategoryName.trim() : formCategory.trim();
    if (!finalCategory) {
      setFormError('Vui lòng chọn hoặc nhập tên chủ đề mới!');
      return;
    }

    if (isCreating) {
      const updated = createQuestion({
        category: finalCategory,
        prompt: formPrompt.trim(),
        options: [formOptions[0].trim(), formOptions[1].trim(), formOptions[2].trim(), formOptions[3].trim()],
        correctIndex: formCorrectIndex,
        hint: formHint.trim(),
      });
      onQuestionsChange(updated);
      sound.playCorrect();
      setIsCreating(false);
    } else if (editingQuestion) {
      const updated = updateQuestion(editingQuestion.id, {
        category: finalCategory,
        prompt: formPrompt.trim(),
        options: [formOptions[0].trim(), formOptions[1].trim(), formOptions[2].trim(), formOptions[3].trim()],
        correctIndex: formCorrectIndex,
        hint: formHint.trim(),
      });
      onQuestionsChange(updated);
      sound.playCorrect();
      setEditingQuestion(null);
    }
  };

  const handleDelete = (id: string) => {
    const updated = deleteQuestion(id);
    onQuestionsChange(updated);
    setDeleteConfirmId(null);
    sound.playExplosion();
  };

  const handleResetDefaults = () => {
    if (window.confirm('Bạn có chắc chắn muốn khôi phục danh sách câu hỏi về mặc định ban đầu không?')) {
      const reset = resetDefaultQuestions();
      onQuestionsChange(reset);
      sound.playItemPickup();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border-2 border-red-500/70 rounded-xl shadow-2xl shadow-red-950/50 overflow-hidden text-slate-100">
        
        {/* Retro Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-red-950 via-slate-900 to-amber-950 border-b border-red-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600/20 border border-red-500 rounded-lg text-red-400">
              <BookOpen className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="font-arcade text-lg sm:text-xl text-yellow-400 tracking-wider">
                QUẢN LÝ CÂU HỎI & ĐỀ THI
              </h2>
              <p className="text-xs text-slate-400 font-military">
                Thêm, sửa, xóa câu hỏi theo từng chủ đề • Lưu trữ tự động vĩnh viễn (F5 không mất)
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playJump();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white hover:bg-red-600/30 rounded-lg transition-colors border border-transparent hover:border-red-500"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Top Action Bar: Filters, Search, Add Button, Reset Button */}
          {(!isCreating && !editingQuestion) && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Search */}
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm câu hỏi hoặc đáp án..."
                    value={searchKeyword}
                    onChange={e => setSearchKeyword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 font-military"
                  />
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleStartCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 active:scale-95 text-white text-sm font-bold font-military rounded-lg shadow-lg shadow-red-600/30 transition-all border border-red-400"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm Câu Hỏi Mới
                  </button>

                  <button
                    onClick={handleResetDefaults}
                    title="Khôi phục danh sách câu hỏi mặc định"
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-military rounded-lg border border-slate-700 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Khôi Phục Gốc
                  </button>
                </div>
              </div>

              {/* Category Pills Filter */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                <button
                  onClick={() => setSelectedCategory('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-military transition-all whitespace-nowrap border ${
                    selectedCategory === 'ALL'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/30'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  Tất cả ({questions.length})
                </button>
                {categories.map(cat => {
                  const count = questions.filter(q => q.category === cat).length;
                  const isSel = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold font-military transition-all whitespace-nowrap border ${
                        isSel
                          ? 'bg-red-600 text-white border-red-400 shadow-md shadow-red-600/30'
                          : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {cat} ({count})
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Form Create / Edit Modal Section */}
          {(isCreating || editingQuestion) && (
            <form onSubmit={handleSaveForm} className="bg-slate-800/90 border border-slate-700 rounded-xl p-5 space-y-4 shadow-inner">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <h3 className="font-arcade text-sm text-yellow-400">
                  {isCreating ? '➕ THÊM CÂU HỎI MỚI' : '✏️ CHỈNH SỬA CÂU HỎI'}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingQuestion(null);
                  }}
                  className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-slate-700/50 rounded"
                >
                  Hủy thao tác
                </button>
              </div>

              {formError && (
                <div className="p-3 bg-red-950/80 border border-red-500 rounded-lg text-red-300 text-xs font-military">
                  ⚠️ {formError}
                </div>
              )}

              {/* Category selector / creator */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 font-military mb-1">
                    Chủ đề câu hỏi
                  </label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-red-500 font-military"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    <option value="__NEW__">+ Tạo chủ đề mới...</option>
                  </select>
                </div>
                {formCategory === '__NEW__' && (
                  <div>
                    <label className="block text-xs font-bold text-yellow-400 font-military mb-1">
                      Nhập tên chủ đề mới
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Đố vui âm nhạc, Tin học..."
                      value={newCategoryName}
                      onChange={e => setNewCategoryName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-amber-500 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 font-military"
                    />
                  </div>
                )}
              </div>

              {/* Question Prompt */}
              <div>
                <label className="block text-xs font-bold text-slate-300 font-military mb-1">
                  Nội dung câu hỏi
                </label>
                <textarea
                  rows={2}
                  placeholder="Nhập nội dung câu đố hoặc câu hỏi..."
                  value={formPrompt}
                  onChange={e => setFormPrompt(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-red-500 font-military"
                />
              </div>

              {/* 4 Options A, B, C, D */}
              <div>
                <label className="block text-xs font-bold text-slate-300 font-military mb-2">
                  4 Phương án trả lời (Tích chọn nút tròn bên cạnh đáp án ĐÚNG):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(['A', 'B', 'C', 'D'] as const).map((letter, idx) => {
                    const isChecked = formCorrectIndex === idx;
                    return (
                      <div
                        key={letter}
                        className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                          isChecked 
                            ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500' 
                            : 'bg-slate-900 border-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          id={`opt-radio-${letter}`}
                          name="correctOption"
                          checked={isChecked}
                          onChange={() => setFormCorrectIndex(idx)}
                          className="w-4 h-4 text-emerald-500 focus:ring-emerald-500 cursor-pointer accent-emerald-500"
                        />
                        <span className={`text-xs font-arcade font-bold px-2 py-0.5 rounded ${
                          isChecked ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {letter}
                        </span>
                        <input
                          type="text"
                          placeholder={`Đáp án ${letter}...`}
                          value={formOptions[idx]}
                          onChange={e => {
                            const newOpts = [...formOptions] as [string, string, string, string];
                            newOpts[idx] = e.target.value;
                            setFormOptions(newOpts);
                          }}
                          className="flex-1 bg-transparent border-none text-sm text-slate-200 focus:outline-none font-military"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Hint */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-amber-400 font-military mb-1">
                  <Lightbulb className="w-4 h-4" />
                  Gợi ý giải thích (Hiện lên khi học sinh trả lời SAI)
                </label>
                <input
                  type="text"
                  placeholder="Gợi ý mẹo giải hoặc kiến thức liên quan..."
                  value={formHint}
                  onChange={e => setFormHint(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-amber-500 font-military"
                />
              </div>

              {/* Save Button */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingQuestion(null);
                  }}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 font-military text-sm rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-military font-bold text-sm rounded-lg shadow-lg shadow-emerald-600/30 border border-emerald-400"
                >
                  {isCreating ? 'Lưu Câu Hỏi Mới' : 'Cập Nhật Câu Hỏi'}
                </button>
              </div>
            </form>
          )}

          {/* Questions List */}
          {(!isCreating && !editingQuestion) && (
            <div className="space-y-3">
              {filteredQuestions.length === 0 ? (
                <div className="text-center py-12 bg-slate-800/40 rounded-xl border border-dashed border-slate-700">
                  <FolderCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 font-military text-sm">
                    Không tìm thấy câu hỏi nào phù hợp với bộ lọc.
                  </p>
                  <button
                    onClick={handleStartCreate}
                    className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold font-military rounded-lg"
                  >
                    + Thêm câu hỏi đầu tiên
                  </button>
                </div>
              ) : (
                filteredQuestions.map((q, qIndex) => (
                  <div
                    key={q.id}
                    className="p-4 bg-slate-800/70 border border-slate-700 hover:border-slate-600 rounded-xl transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-arcade text-xs text-yellow-400">
                            #{qIndex + 1}
                          </span>
                          <span className="px-2.5 py-0.5 bg-slate-900 border border-slate-600 text-slate-300 rounded text-xs font-military">
                            {q.category}
                          </span>
                        </div>
                        <h4 className="font-military font-bold text-slate-100 text-sm sm:text-base">
                          {q.prompt}
                        </h4>
                      </div>

                      {/* Actions: Edit, Delete */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleStartEdit(q)}
                          title="Sửa câu hỏi"
                          className="p-2 bg-slate-700/60 hover:bg-blue-600 text-blue-400 hover:text-white rounded-lg transition-colors border border-slate-600"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        
                        {deleteConfirmId === q.id ? (
                          <div className="flex items-center gap-1 bg-red-950 p-1 rounded-lg border border-red-500">
                            <span className="text-[10px] text-red-300 font-military px-1">Xóa?</span>
                            <button
                              onClick={() => handleDelete(q.id)}
                              className="px-2 py-0.5 bg-red-600 hover:bg-red-500 text-white text-xs rounded font-bold"
                            >
                              Có
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded"
                            >
                              Không
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(q.id)}
                            title="Xóa câu hỏi"
                            className="p-2 bg-slate-700/60 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition-colors border border-slate-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Options Preview */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.options.map((opt, idx) => {
                        const isCorrect = idx === q.correctIndex;
                        const letter = ['A', 'B', 'C', 'D'][idx];
                        return (
                          <div
                            key={idx}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-military ${
                              isCorrect
                                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/60'
                                : 'bg-slate-900/60 text-slate-300 border border-slate-800'
                            }`}
                          >
                            <span className={`w-5 h-5 flex items-center justify-center font-arcade text-[10px] rounded ${
                              isCorrect ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {letter}
                            </span>
                            <span className="truncate flex-1">{opt}</span>
                            {isCorrect && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Hint preview */}
                    {q.hint && (
                      <div className="flex items-center gap-1.5 text-xs text-amber-400/90 font-military bg-amber-950/20 px-3 py-1.5 rounded-lg border border-amber-900/40">
                        <Lightbulb className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                        <span>Gợi ý: {q.hint}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-military">
          <span>Tổng số: <strong className="text-yellow-400">{questions.length}</strong> câu hỏi trong ngân hàng đề</span>
          <button
            onClick={() => {
              sound.playJump();
              onClose();
            }}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-bold"
          >
            Đóng bảng
          </button>
        </div>

      </div>
    </div>
  );
};
