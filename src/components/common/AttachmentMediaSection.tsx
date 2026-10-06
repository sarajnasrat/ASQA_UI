import { Download, Music, PlayCircle, Video } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toApiUrl } from "../../config/api";

export type MediaAttachment = {
  id?: number;
  attachmentName?: string;
  name?: string;
  fileName?: string;
  file?: string;
  filePath?: string;
  fileType?: string;
  fileSize?: number;
};

export const attachmentMediaKind = (attachment: MediaAttachment): "audio" | "video" | null => {
  const type = (attachment.fileType || "").toLowerCase();
  const name = attachment.attachmentName || attachment.fileName || attachment.name || attachment.file || attachment.filePath || "";
  if (type.startsWith("video/") || /\.(mp4|webm|mov|avi|mkv)(?:[?#].*)?$/i.test(name)) return "video";
  if (type.startsWith("audio/") || /\.(mp3|wav|ogg|m4a|aac|flac)(?:[?#].*)?$/i.test(name)) return "audio";
  return null;
};

export default function AttachmentMediaSection({ attachments }: { attachments: MediaAttachment[] }) {
  const { t } = useTranslation();
  const media = attachments.filter((attachment, index, all) => attachmentMediaKind(attachment)
    && all.findIndex((item) => (item.file || item.filePath) === (attachment.file || attachment.filePath)) === index);
  if (media.length === 0) return null;
  return (
    <section className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
        <PlayCircle className="h-5 w-5 text-blue-600" />
        {t("commitee.assignment.mediaFiles")} ({media.length})
      </h3>
      {media.length ? <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{media.map((attachment, index) => {
        const kind = attachmentMediaKind(attachment);
        const Icon = kind === "video" ? Video : Music;
        const href = toApiUrl(attachment.file || attachment.filePath);
        const name = attachment.attachmentName || attachment.fileName || attachment.name;
        return <div key={`${attachment.id}-${index}`} className="overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3 p-3">
            <Icon className="h-5 w-5 shrink-0 text-blue-600" />
            <p className="min-w-0 flex-1 break-words font-medium text-gray-900">{name}</p>
            <a href={href} download target="_blank" rel="noopener noreferrer" title={t("common.download")} aria-label={t("common.download")} className="rounded-lg p-2 text-gray-500 hover:bg-blue-100 hover:text-blue-600"><Download className="h-4 w-4" /></a>
          </div>
          {kind === "video" ? <video src={href} controls preload="metadata" className="max-h-72 w-full bg-black" />
            : <div className="p-3 pt-0"><audio src={href} controls preload="metadata" className="w-full" /></div>}
        </div>;
      })}</div> : <p className="py-6 text-center text-sm text-gray-500">{t("common.noDocuments")}</p>}
    </section>
  );
}
