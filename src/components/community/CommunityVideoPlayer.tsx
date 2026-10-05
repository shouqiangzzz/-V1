import React, { useEffect, useState } from 'react';
import { resolveCommunityVideoUrl } from '../../services/mediaStorage';
import { useLanguage } from '../../services/i18n';

interface CommunityVideoPlayerProps {
  src: string;
  title: string;
  poster?: string;
  autoPlay?: boolean;
  className?: string;
}

export const CommunityVideoPlayer: React.FC<CommunityVideoPlayerProps> = ({
  src,
  title,
  poster,
  autoPlay = false,
  className = '',
}) => {
  const { language } = useLanguage();
  const [resolvedSrc, setResolvedSrc] = useState('');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    let releaseSource: (() => void) | undefined;

    setResolvedSrc('');
    setHasError(false);

    resolveCommunityVideoUrl(src)
      .then((result) => {
        if (!isCurrent) {
          result.release?.();
          return;
        }
        releaseSource = result.release;
        setResolvedSrc(result.url);
      })
      .catch(() => {
        if (isCurrent) setHasError(true);
      });

    return () => {
      isCurrent = false;
      releaseSource?.();
    };
  }, [src]);

  if (hasError) {
    return (
      <div className={`flex min-h-48 items-center justify-center bg-slate-950 px-6 text-center text-sm text-slate-400 ${className}`} role="status">
        {language === 'zh'
          ? '视频加载失败，请检查文件格式或重新上传。'
          : 'Unable to play this video. Check its format or upload it again.'}
      </div>
    );
  }

  if (!resolvedSrc) {
    return <div className={`flex min-h-48 items-center justify-center bg-slate-950 text-sm text-slate-500 ${className}`} role="status">
      {language === 'zh' ? '正在加载视频…' : 'Loading video…'}
    </div>;
  }

  return (
    <video
      key={resolvedSrc}
      src={resolvedSrc}
      poster={poster}
      title={title}
      controls
      autoPlay={autoPlay}
      playsInline
      preload="metadata"
      onError={() => setHasError(true)}
      className={className}
    />
  );
};
