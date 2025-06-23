
import React from 'react';

interface PostContentProps {
  content?: string;
  mediaUrl?: string;
}

export const PostContent: React.FC<PostContentProps> = ({ content, mediaUrl }) => {
  const isImage = mediaUrl && (mediaUrl.includes('.jpg') || mediaUrl.includes('.jpeg') || mediaUrl.includes('.png') || mediaUrl.includes('.gif') || mediaUrl.includes('.webp'));
  const isVideo = mediaUrl && (mediaUrl.includes('.mp4') || mediaUrl.includes('.webm') || mediaUrl.includes('.mov'));

  return (
    <>
      {content && (
        <p className="text-sm mb-3 break-words leading-relaxed">{content}</p>
      )}
      
      {mediaUrl && (
        <div className="mb-3">
          {isImage && (
            <img
              src={mediaUrl}
              alt="Post media"
              className="max-w-full rounded-lg border"
              loading="lazy"
            />
          )}
          {isVideo && (
            <video
              src={mediaUrl}
              controls
              className="max-w-full rounded-lg border"
              preload="metadata"
            />
          )}
        </div>
      )}
    </>
  );
};
