import React from 'react';
import { Building2, Pencil, Trash2, ChevronRight, Copy } from 'lucide-react';
import { motion } from 'framer-motion';
import { COLORS, easeOutQuart } from '../../lib/utils';
import { Venue, Event } from '../../types';

/* ── VenueCard ───────────────────────────────────────────── */
export function VenueCard({ venue, eventCount, onClick, onEdit, onDelete }: {
  venue: Venue; eventCount: number; onClick: () => void;
  onEdit?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
}) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.3, ease: easeOutQuart }}
      className="group bg-white/[0.018] border border-[#3b3733] cursor-pointer overflow-hidden flex flex-col relative card-hover rounded-xl"
    >
      <div className="h-[2px] w-0 group-hover:w-full bg-accent transition-all duration-500 origin-left" />

      <div className="p-7 flex flex-col gap-7 flex-1">
        <div className="flex items-start justify-between">
          <div className="w-9 h-9 border border-[#3b3733] flex items-center justify-center group-hover:border-accent/30 transition-colors shrink-0 rounded-xl">
            <Building2 size={15} className="text-[#AEAEB2] group-hover:text-accent transition-colors" />
          </div>
          {(onEdit || onDelete) && (
            <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
              {onEdit && (
                <button onClick={onEdit}
                  className="w-7 h-7 flex items-center justify-center text-[#AEAEB2] hover:text-accent transition-colors">
                  <Pencil size={12} />
                </button>
              )}
              {onDelete && (
                <button onClick={onDelete}
                  className="w-7 h-7 flex items-center justify-center text-[#AEAEB2] hover:text-red-500 transition-colors">
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex-1">
          <h3 className="font-bold text-[clamp(22px,3vw,30px)] text-white leading-tight group-hover:text-accent transition-colors">
            {venue.name}
          </h3>
          <p className="text-xs text-[#AEAEB2] mt-1">{venue.address}</p>
        </div>

        <div className="flex items-end justify-between border-t border-[#2d2a26] pt-5">
          <div>
            <span className="hv font-black text-[52px] leading-none text-[#3a3a3a] group-hover:text-[#8E8E93] transition-colors select-none">
              {String(eventCount).padStart(2, '0')}
            </span>
            <p className="text-xs text-[#AEAEB2] mt-0.5">eventi</p>
          </div>
          <div className="flex items-center gap-1.5 text-[#AEAEB2] group-hover:text-accent transition-colors mb-1">
            <span className="text-xs font-medium">Apri</span>
            <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── EventCard ───────────────────────────────────────────── */
export function EventCard({ event, venueName, onClick, onEdit, onDelete, onDuplicate }: {
  event: Event; venueName?: string; onClick: () => void;
  onEdit?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
  onDuplicate?: (e: React.MouseEvent) => void;
}) {
  const formattedDate = new Date(event.date).toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' });
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.3, ease: easeOutQuart }}
      className="group bg-white/[0.018] border border-[#3b3733] cursor-pointer overflow-hidden flex flex-col card-hover rounded-xl"
    >
      {/* Cover image */}
      {event.coverImage ? (
        <div className="relative h-36 overflow-hidden">
          <img src={event.coverImage} alt={event.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1d1b19] via-transparent to-transparent" />
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <span
              className="text-xs font-medium rounded-full px-2.5 py-0.5"
              style={
                event.status === 'active'
                  ? { color: COLORS.success, background: 'rgba(0,0,0,0.7)' }
                  : { color: '#999', background: 'rgba(0,0,0,0.7)' }
              }
            >
              {event.status === 'active' && <span className="inline-block w-1.5 h-1.5 rounded-full blink mr-1.5 align-middle" style={{ background: COLORS.success }} />}
              {event.status}
            </span>
            {(onEdit || onDelete || onDuplicate) && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {onEdit && <button onClick={onEdit} title="Modifica" className="w-7 h-7 flex items-center justify-center bg-black/60 text-[#AEAEB2] hover:text-accent transition-colors"><Pencil size={12} /></button>}
                {onDuplicate && <button onClick={onDuplicate} title="Duplica" className="w-7 h-7 flex items-center justify-center bg-black/60 text-[#AEAEB2] hover:text-accent transition-colors"><Copy size={12} /></button>}
                {onDelete && <button onClick={onDelete} title="Elimina" className="w-7 h-7 flex items-center justify-center bg-black/60 text-[#AEAEB2] hover:text-red-500 transition-colors"><Trash2 size={12} /></button>}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="h-[2px] w-0 group-hover:w-full bg-accent transition-all duration-500 origin-left" />
      )}

      <div className="p-5 flex flex-col gap-4 flex-1">
        {!event.coverImage && (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {venueName && (
                <span className="text-xs text-[#636366] flex items-center gap-1.5 shrink-0">
                  <Building2 size={9} /> {venueName}
                </span>
              )}
              <span
                className="text-xs font-medium rounded-full px-2.5 py-0.5 shrink-0"
                style={
                  event.status === 'active'
                    ? { color: COLORS.success, background: 'rgba(34,197,94,0.10)' }
                    : event.status === 'draft'
                    ? { color: COLORS.warning, background: 'rgba(245,158,11,0.10)' }
                    : { color: '#999', background: '#2d2a26' }
                }
              >
                {event.status === 'active' && <span className="inline-block w-1.5 h-1.5 rounded-full blink mr-1.5 align-middle" style={{ background: COLORS.success }} />}
                {event.status}
              </span>
            </div>
            {(onEdit || onDelete || onDuplicate) && (
              <div className="flex items-center gap-1 shrink-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                {onEdit && <button onClick={onEdit} title="Modifica" className="w-7 h-7 flex items-center justify-center text-[#AEAEB2] hover:text-accent transition-colors"><Pencil size={12} /></button>}
                {onDuplicate && <button onClick={onDuplicate} title="Duplica" className="w-7 h-7 flex items-center justify-center text-[#AEAEB2] hover:text-accent transition-colors"><Copy size={12} /></button>}
                {onDelete && <button onClick={onDelete} title="Elimina" className="w-7 h-7 flex items-center justify-center text-[#AEAEB2] hover:text-red-500 transition-colors"><Trash2 size={12} /></button>}
              </div>
            )}
          </div>
        )}

        <div className="flex-1">
          {event.coverImage && venueName && (
            <span className="text-[10px] font-sans text-[#636366] flex items-center gap-1.5 mb-1">
              <Building2 size={9} /> {venueName}
            </span>
          )}
          <div className="flex items-center gap-2 mb-1.5">
            <p className="font-mono text-[10px] text-[#636366] tracking-wider">{formattedDate}</p>
            {event.time && <p className="font-mono text-[10px] text-[#8E8E93]">· {event.time}</p>}
          </div>
          <h3 className="font-bold text-xl text-white leading-tight">{event.name}</h3>
          {event.description && (
            <p className="text-[11px] font-sans text-[#636366] mt-2 leading-relaxed line-clamp-2">{event.description}</p>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-[#2d2a26] pt-3">
          <div className="flex items-center gap-1.5 text-[#636366] group-hover:text-accent transition-colors">
            <span className="text-xs font-medium">Apri</span>
            <ChevronRight size={11} className="group-hover:translate-x-1 transition-transform" />
          </div>
          {event.maxCapacity && (
            <span className="text-[9px] font-mono text-[#8E8E93]">Max {event.maxCapacity}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
