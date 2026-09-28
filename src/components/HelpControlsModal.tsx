import React from 'react';
import { X, Keyboard, Shield, Zap, Sparkles } from 'lucide-react';
import { sound } from '../utils/sound';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpControlsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-slate-900 border-2 border-yellow-500/70 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-yellow-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 text-yellow-400 border border-yellow-500 rounded-lg">
              <Keyboard className="w-5 h-5" />
            </div>
            <h2 className="font-arcade text-sm sm:text-base text-yellow-400">
              HƯỚNG DẪN ĐIỀU KHIỂN & VŨ KHÍ
            </h2>
          </div>
          <button
            onClick={() => {
              sound.playJump();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Controls table */}
          <div className="space-y-3">
            <h3 className="font-arcade text-xs text-yellow-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              1. PHÍM ĐIỀU KHIỂN (BÀN PHÍM & NÚT CẢM ỨNG ẢO)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-military">
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center justify-between">
                <span className="text-slate-300">Chạy Trái / Phải:</span>
                <span className="font-bold text-yellow-400 font-arcade">A / D hoặc ◀ / ▶</span>
              </div>
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center justify-between">
                <span className="text-slate-300">Nhảy lên bậc địa hình:</span>
                <span className="font-bold text-yellow-400 font-arcade">W / SPACE / ▲</span>
              </div>
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center justify-between">
                <span className="text-slate-300">Cúi người né đường đạn:</span>
                <span className="font-bold text-yellow-400 font-arcade">S hoặc ▼</span>
              </div>
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center justify-between">
                <span className="text-slate-300">Bắn súng (Thẳng / Chéo):</span>
                <span className="font-bold text-red-400 font-arcade">Phím J hoặc Chuột</span>
              </div>
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center justify-between col-span-1 sm:col-span-2">
                <span className="text-slate-300">Kỹ năng Mana (Khiên Hào Quang 5s):</span>
                <span className="font-bold text-cyan-400 font-arcade">Phím K (Tốn 40 Mana)</span>
              </div>
            </div>
          </div>

          {/* Drops & Weapons */}
          <div className="space-y-3">
            <h3 className="font-arcade text-xs text-yellow-400 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              2. HỘP TIẾP TẾ BAY & VẬT PHẨM
            </h3>
            <p className="text-xs text-slate-300 font-military">
              Bắn vỡ các hộp tiếp tế bay ngang qua bầu trời để rơi ra các vật phẩm sức mạnh:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-slate-800/80 border border-emerald-500/50 rounded-xl text-center space-y-1">
                <div className="text-2xl">🍄</div>
                <div className="font-arcade text-xs text-emerald-400">Nấm Thần Kỳ</div>
                <p className="text-[11px] text-slate-300 font-military">
                  Hồi phục 100% thanh Máu (HP) và thanh Mana ngay lập tức!
                </p>
              </div>

              <div className="p-3.5 bg-slate-800/80 border border-red-500/50 rounded-xl text-center space-y-1">
                <div className="w-8 h-8 rounded-full bg-red-600 text-white font-arcade text-xs font-black flex items-center justify-center mx-auto shadow-lg shadow-red-500/40">
                  S
                </div>
                <div className="font-arcade text-xs text-red-400">Súng S (Spread)</div>
                <p className="text-[11px] text-slate-300 font-military">
                  Bắn chùm tỏa 3 tia hình quạt, sát thương diện rộng cực lớn.
                </p>
              </div>

              <div className="p-3.5 bg-slate-800/80 border border-cyan-500/50 rounded-xl text-center space-y-1">
                <div className="w-8 h-8 rounded-full bg-cyan-600 text-white font-arcade text-xs font-black flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/40">
                  L
                </div>
                <div className="font-arcade text-xs text-cyan-400">Súng L (Laser)</div>
                <p className="text-[11px] text-slate-300 font-military">
                  Tia laser dài xuyên thấu qua mọi kẻ địch liên tục!
                </p>
              </div>
            </div>
          </div>

          {/* Barrier & Day Night */}
          <div className="space-y-3">
            <h3 className="font-arcade text-xs text-yellow-400 flex items-center gap-2">
              <Shield className="w-4 h-4 text-yellow-400" />
              3. CỔNG PHONG ẤN & CHU KỲ NGÀY ĐÊM
            </h3>
            <div className="p-4 bg-slate-800/70 border border-slate-700 rounded-xl space-y-2 text-xs font-military text-slate-300 leading-relaxed">
              <p>
                • <strong>Cổng phong ấn trắc nghiệm:</strong> Khi chạm vào cổng, toàn bộ kẻ địch và đạn dược sẽ đóng băng hoàn toàn. Hãy trả lời câu hỏi trắc nghiệm để phá hủy cổng đi tiếp. Nếu sai, hệ thống cung cấp gợi ý và yêu cầu chọn lại cho đến khi đúng.
              </p>
              <p>
                • <strong>Chu kỳ Ngày - Hoàng hôn - Đêm:</strong> Nền trời tự đổi màu mượt mà mỗi 35-45 giây. Khi đêm buông xuống, bóng tối bao trùm và nhân vật có quầng sáng bảo vệ phát quang bao quanh!
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              sound.playJump();
              onClose();
            }}
            className="px-5 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-arcade text-xs rounded-xl font-bold transition-colors"
          >
            ĐÃ HIỂU, VÀO TRẬN!
          </button>
        </div>

      </div>
    </div>
  );
};
