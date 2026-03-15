"use client";

import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

export type LogoItem =
    | {
        node: React.ReactNode;
        href?: string;
        title?: string;
        ariaLabel?: string;
    }
    | {
        src: string;
        alt?: string;
        href?: string;
        title?: string;
        srcSet?: string;
        sizes?: string;
        width?: number;
        height?: number;
    };

export interface LogoLoopProps {
    logos: LogoItem[];
    speed?: number;
    direction?: "left" | "right" | "up" | "down";
    width?: number | string;
    logoHeight?: number;
    gap?: number;
    pauseOnHover?: boolean;
    hoverSpeed?: number;
    fadeOut?: boolean;
    fadeOutColor?: string;
    scaleOnHover?: boolean;
    renderItem?: (item: LogoItem, key: React.Key) => React.ReactNode;
    ariaLabel?: string;
    className?: string;
    style?: React.CSSProperties;
}

const ANIMATION_CONFIG = {
    SMOOTH_TAU: 0.25,
    MIN_COPIES: 2,
    COPY_HEADROOM: 2,
} as const;

const toCssLength = (value?: number | string): string | undefined =>
    typeof value === "number" ? `${value}px` : value ?? undefined;

const cx = (...parts: Array<string | false | null | undefined>) =>
    parts.filter(Boolean).join(" ");

const useResizeObserver = (
    callback: () => void,
    elements: Array<React.RefObject<Element | null>>,
    dependencies: React.DependencyList
) => {
    useEffect(() => {
        if (!window.ResizeObserver) {
            window.addEventListener("resize", callback);
            callback();
            return () => window.removeEventListener("resize", callback);
        }
        const observers = elements.map((ref) => {
            if (!ref.current) return null;
            const obs = new ResizeObserver(callback);
            obs.observe(ref.current);
            return obs;
        });
        callback();
        return () => observers.forEach((o) => o?.disconnect());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, dependencies);
};

const useImageLoader = (
    seqRef: React.RefObject<HTMLUListElement | null>,
    onLoad: () => void,
    dependencies: React.DependencyList
) => {
    useEffect(() => {
        const images = seqRef.current?.querySelectorAll("img") ?? [];
        if (images.length === 0) {
            onLoad();
            return;
        }
        let remaining = images.length;
        const handle = () => {
            remaining -= 1;
            if (remaining === 0) onLoad();
        };
        images.forEach((img) => {
            const el = img as HTMLImageElement;
            if (el.complete) {
                handle();
            } else {
                el.addEventListener("load", handle, { once: true });
                el.addEventListener("error", handle, { once: true });
            }
        });
        return () => {
            images.forEach((img) => {
                img.removeEventListener("load", handle);
                img.removeEventListener("error", handle);
            });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, dependencies);
};

const useAnimationLoop = (
    trackRef: React.RefObject<HTMLDivElement | null>,
    targetVelocity: number,
    seqWidth: number,
    seqHeight: number,
    isHovered: boolean,
    hoverSpeed: number | undefined,
    isVertical: boolean
) => {
    const rafRef = useRef<number | null>(null);
    const lastTsRef = useRef<number | null>(null);
    const offsetRef = useRef(0);
    const velRef = useRef(0);

    useEffect(() => {
        const track = trackRef.current;
        if (!track) return;

        const prefersReduced =
            typeof window !== "undefined" &&
            window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

        const seqSize = isVertical ? seqHeight : seqWidth;

        if (seqSize > 0) {
            offsetRef.current = ((offsetRef.current % seqSize) + seqSize) % seqSize;
            track.style.transform = isVertical
                ? `translate3d(0, ${-offsetRef.current}px, 0)`
                : `translate3d(${-offsetRef.current}px, 0, 0)`;
        }

        if (prefersReduced) {
            track.style.transform = "translate3d(0, 0, 0)";
            return () => {
                lastTsRef.current = null;
            };
        }

        const animate = (ts: number) => {
            if (lastTsRef.current === null) lastTsRef.current = ts;
            const dt = Math.max(0, ts - lastTsRef.current) / 1000;
            lastTsRef.current = ts;

            const target =
                isHovered && hoverSpeed !== undefined ? hoverSpeed : targetVelocity;
            const ease = 1 - Math.exp(-dt / ANIMATION_CONFIG.SMOOTH_TAU);
            velRef.current += (target - velRef.current) * ease;

            if (seqSize > 0) {
                let next = offsetRef.current + velRef.current * dt;
                next = ((next % seqSize) + seqSize) % seqSize;
                offsetRef.current = next;
                track.style.transform = isVertical
                    ? `translate3d(0, ${-offsetRef.current}px, 0)`
                    : `translate3d(${-offsetRef.current}px, 0, 0)`;
            }

            rafRef.current = requestAnimationFrame(animate);
        };

        rafRef.current = requestAnimationFrame(animate);

        return () => {
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
            lastTsRef.current = null;
        };
    }, [targetVelocity, seqWidth, seqHeight, isHovered, hoverSpeed, isVertical]);
};

export const LogoLoop = React.memo<LogoLoopProps>(
    ({
        logos,
        speed = 120,
        direction = "left",
        width = "100%",
        logoHeight = 28,
        gap = 32,
        pauseOnHover,
        hoverSpeed,
        fadeOut = false,
        fadeOutColor,
        scaleOnHover = false,
        renderItem,
        ariaLabel = "Partner logos",
        className,
        style,
    }): React.ReactElement => {
        const containerRef = useRef<HTMLDivElement>(null);
        const trackRef = useRef<HTMLDivElement>(null);
        const seqRef = useRef<HTMLUListElement>(null);

        const [seqWidth, setSeqWidth] = useState<number>(0);
        const [seqHeight, setSeqHeight] = useState<number>(0);
        const [copyCount, setCopyCount] = useState<number>(ANIMATION_CONFIG.MIN_COPIES);
        const [isHovered, setIsHovered] = useState<boolean>(false);

        const effectiveHoverSpeed = useMemo(() => {
            if (hoverSpeed !== undefined) return hoverSpeed;
            if (pauseOnHover === true) return 0;
            if (pauseOnHover === false) return undefined;
            return 0;
        }, [hoverSpeed, pauseOnHover]);

        const isVertical = direction === "up" || direction === "down";

        const targetVelocity = useMemo(() => {
            const mag = Math.abs(speed);
            const dir = isVertical
                ? direction === "up"
                    ? 1
                    : -1
                : direction === "left"
                    ? 1
                    : -1;
            return mag * dir * (speed < 0 ? -1 : 1);
        }, [speed, direction, isVertical]);

        const updateDimensions = useCallback(() => {
            const containerWidth = containerRef.current?.clientWidth ?? 0;
            const rect = seqRef.current?.getBoundingClientRect?.();
            const sw = rect?.width ?? 0;
            const sh = rect?.height ?? 0;

            if (isVertical) {
                const ph = containerRef.current?.parentElement?.clientHeight ?? 0;
                if (containerRef.current && ph > 0) {
                    containerRef.current.style.height = `${Math.ceil(ph)}px`;
                }
                if (sh > 0) {
                    setSeqHeight(Math.ceil(sh));
                    const vp = containerRef.current?.clientHeight ?? ph ?? sh;
                    setCopyCount(
                        Math.max(
                            ANIMATION_CONFIG.MIN_COPIES,
                            Math.ceil(vp / sh) + ANIMATION_CONFIG.COPY_HEADROOM
                        )
                    );
                }
            } else if (sw > 0) {
                setSeqWidth(Math.ceil(sw));
                setCopyCount(
                    Math.max(
                        ANIMATION_CONFIG.MIN_COPIES,
                        Math.ceil(containerWidth / sw) + ANIMATION_CONFIG.COPY_HEADROOM
                    )
                );
            }
        }, [isVertical]);

        useResizeObserver(
            updateDimensions,
            [containerRef, seqRef],
            [logos, gap, logoHeight, isVertical]
        );
        useImageLoader(seqRef, updateDimensions, [logos, gap, logoHeight, isVertical]);
        useAnimationLoop(
            trackRef,
            targetVelocity,
            seqWidth,
            seqHeight,
            isHovered,
            effectiveHoverSpeed,
            isVertical
        );

        const cssVars = useMemo(
            () =>
            ({
                "--logoloop-gap": `${gap}px`,
                "--logoloop-logoHeight": `${logoHeight}px`,
                ...(fadeOutColor && { "--logoloop-fadeColor": fadeOutColor }),
            } as React.CSSProperties),
            [gap, logoHeight, fadeOutColor]
        );

        const rootClasses = useMemo(
            () =>
                cx(
                    "relative group",
                    isVertical ? "overflow-hidden h-full inline-block" : "overflow-x-hidden",
                    "[--logoloop-gap:32px]",
                    "[--logoloop-logoHeight:28px]",
                    "[--logoloop-fadeColorAuto:#F7F5F0]",
                    scaleOnHover && "py-[calc(var(--logoloop-logoHeight)*0.1)]",
                    className
                ),
            [isVertical, scaleOnHover, className]
        );

        const handleMouseEnter = useCallback(() => {
            if (effectiveHoverSpeed !== undefined) setIsHovered(true);
        }, [effectiveHoverSpeed]);

        const handleMouseLeave = useCallback(() => {
            if (effectiveHoverSpeed !== undefined) setIsHovered(false);
        }, [effectiveHoverSpeed]);

        const renderLogoItem = useCallback(
            (item: LogoItem, key: React.Key): React.ReactNode => {
                const liClass = cx(
                    "flex-none text-[length:var(--logoloop-logoHeight)] leading-[1]",
                    isVertical ? "mb-[var(--logoloop-gap)]" : "mr-[var(--logoloop-gap)]",
                    scaleOnHover && "overflow-visible group/item"
                );

                if (renderItem) {
                    return (
                        <li className={liClass} key={key} role="listitem">
                            {renderItem(item, key)}
                        </li>
                    );
                }

                const isNodeItem = "node" in item;
                const scaleClass =
                    scaleOnHover
                        ? "transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover/item:scale-110"
                        : "";

                const content = isNodeItem ? (
                    <span className={cx("inline-flex items-center motion-reduce:transition-none", scaleClass)}>
                        {(item as { node: React.ReactNode }).node}
                    </span>
                ) : (
                    <img
                        className={cx(
                            "h-[var(--logoloop-logoHeight)] w-auto block object-contain",
                            "[-webkit-user-drag:none] pointer-events-none motion-reduce:transition-none",
                            scaleClass
                        )}
                        src={(item as { src: string }).src}
                        alt={(item as { alt?: string }).alt ?? ""}
                        loading="lazy"
                        decoding="async"
                        draggable={false}
                    />
                );

                const itemHref = (item as { href?: string }).href;

                const inner = itemHref ? (
                    <a
                        className="inline-flex items-center no-underline rounded hover:opacity-80 transition-opacity duration-200"
                        href={itemHref}
                        target="_blank"
                        rel="noreferrer noopener"
                    >
                        {content}
                    </a>
                ) : (
                    content
                );

                return (
                    <li className={liClass} key={key} role="listitem">
                        {inner}
                    </li>
                );
            },
            [isVertical, scaleOnHover, renderItem]
        );

        const logoLists = useMemo(
            () =>
                Array.from({ length: copyCount }, (_, copyIndex) => (
                    <ul
                        className={cx("flex items-center", isVertical && "flex-col")}
                        key={`copy-${copyIndex}`}
                        role="list"
                        aria-hidden={copyIndex > 0}
                        ref={copyIndex === 0 ? seqRef : undefined}
                    >
                        {logos.map((item, i) => renderLogoItem(item, `${copyIndex}-${i}`))}
                    </ul>
                )),
            [copyCount, logos, renderLogoItem, isVertical]
        );

        const containerStyle = useMemo(
            (): React.CSSProperties => ({
                width: isVertical
                    ? toCssLength(width) === "100%"
                        ? undefined
                        : toCssLength(width)
                    : toCssLength(width) ?? "100%",
                ...cssVars,
                ...style,
            }),
            [width, cssVars, style, isVertical]
        );

        return (
            <div
                ref={containerRef}
                className={rootClasses}
                style={containerStyle}
                role="region"
                aria-label={ariaLabel}
            >
                {fadeOut && (
                    <>
                        {isVertical ? (
                            <>
                                <div
                                    aria-hidden
                                    className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[clamp(24px,8%,120px)] bg-[linear-gradient(to_bottom,var(--logoloop-fadeColor,var(--logoloop-fadeColorAuto))_0%,rgba(0,0,0,0)_100%)]"
                                />
                                <div
                                    aria-hidden
                                    className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[clamp(24px,8%,120px)] bg-[linear-gradient(to_top,var(--logoloop-fadeColor,var(--logoloop-fadeColorAuto))_0%,rgba(0,0,0,0)_100%)]"
                                />
                            </>
                        ) : (
                            <>
                                <div
                                    aria-hidden
                                    className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[clamp(24px,8%,120px)] bg-[linear-gradient(to_right,var(--logoloop-fadeColor,var(--logoloop-fadeColorAuto))_0%,rgba(0,0,0,0)_100%)]"
                                />
                                <div
                                    aria-hidden
                                    className="pointer-events-none absolute inset-y-0 right-0 z-10 w-[clamp(24px,8%,120px)] bg-[linear-gradient(to_left,var(--logoloop-fadeColor,var(--logoloop-fadeColorAuto))_0%,rgba(0,0,0,0)_100%)]"
                                />
                            </>
                        )}
                    </>
                )}

                <div
                    className={cx(
                        "flex will-change-transform select-none relative z-0 motion-reduce:transform-none",
                        isVertical ? "flex-col h-max w-full" : "flex-row w-max"
                    )}
                    ref={trackRef}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    {logoLists}
                </div>
            </div>
        );
    }
);

LogoLoop.displayName = "LogoLoop";

export default LogoLoop;
