"use client";

import React, { useEffect, useRef, useState } from "react";
import lottie, { type AnimationItem } from "lottie-web";
import pako from "pako";

interface TgsPlayerProps {
  src: string;
  className?: string;
  style?: React.CSSProperties;
  unstyled?: boolean;
}

export const TgsPlayer = React.memo(
  ({ src, className, style, unstyled = false }: TgsPlayerProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<AnimationItem | null>(null);
    const [animationData, setAnimationData] = useState<object | null>(null);
    const baseClass = unstyled
      ? "group flex items-center justify-center"
      : "group flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200/80 p-2 text-2xl text-neutral-500 transition-all duration-300 hover:bg-neutral-300/50 dark:bg-neutral-800/80 dark:hover:bg-neutral-800/50";
    const wrapperClassName = className ? `${baseClass} ${className}` : baseClass;

    useEffect(() => {
      const fetchAndDecompress = async () => {
        try {
          const response = await fetch(src);
          const compressed = await response.arrayBuffer();
          const json = pako.inflate(new Uint8Array(compressed), {
            to: "string",
          });
          setAnimationData(JSON.parse(json));
        } catch (err) {
          console.error("TGS parse error:", err);
        }
      };
      fetchAndDecompress();
    }, [src]);

    useEffect(() => {
      if (!animationData || !containerRef.current) return;

      animationRef.current = lottie.loadAnimation({
        container: containerRef.current,
        renderer: "canvas",
        loop: true,
        autoplay: true,
        animationData,
      });

      return () => {
        animationRef.current?.destroy();
      };
    }, [animationData]);


    if (!animationData) {
      return <div className={`${wrapperClassName} animate-pulse`} />;
    }

    return (
      <div className={wrapperClassName}>
        <div
          ref={containerRef}
          style={style}
          className="flex h-full w-full items-center justify-center"
        />
      </div>
    );
  }
);

TgsPlayer.displayName = "TgsPlayer";
