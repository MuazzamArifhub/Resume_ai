"use client"

import { motion, type Variants } from "framer-motion"
import { ArrowRight, Circle } from "lucide-react"

import { cn } from "@/lib/utils"

function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-white/[0.08]",
}: {
  className?: string
  delay?: number
  width?: number
  height?: number
  rotate?: number
  gradient?: string
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -150,
        rotate: rotate - 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
        rotate,
      }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
      className={cn("absolute", className)}
    >
      <motion.div
        animate={{
          y: [0, 15, 0],
        }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{
          width,
          height,
        }}
        className="relative"
      >
        <div
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-r to-transparent",
            gradient,
            "border-2 border-white/[0.15] backdrop-blur-[2px]",
            "shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]",
            "after:absolute after:inset-0 after:rounded-full",
            "after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]"
          )}
        />
      </motion.div>
    </motion.div>
  )
}

function HeroGeometric({
  badge = "HYFY",
  title1 = "Elevate Your",
  title2 = "Digital Vision",
  description = "Crafting exceptional digital experiences through innovative design and cutting-edge technology.",
  ctaLabel,
  onCtaClick,
}: {
  badge?: string
  title1?: string
  title2?: string
  description?: string
  ctaLabel?: string
  onCtaClick?: () => void
}) {
  const fadeUpVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 0.5 + i * 0.2,
        ease: [0.25, 0.4, 0.25, 1] as const,
      },
    }),
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#030303]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.075),transparent_32%),linear-gradient(180deg,#050505_0%,#030303_58%,#080304_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.055] via-transparent to-rose-500/[0.055] blur-3xl" />

      <div className="absolute inset-0 overflow-hidden">
        <ElegantShape
          delay={0.3}
          width={1180}
          height={230}
          rotate={12}
          gradient="from-indigo-400/[0.10]"
          className="left-[-30%] top-[14%] md:left-[-10%] md:top-[17%]"
        />

        <ElegantShape
          delay={0.5}
          width={590}
          height={130}
          rotate={-15}
          gradient="from-amber-400/[0.13]"
          className="right-[-22%] top-[13%] md:right-[8%] md:top-[14%]"
        />

        <ElegantShape
          delay={0.4}
          width={360}
          height={90}
          rotate={-28}
          gradient="from-cyan-400/[0.12]"
          className="left-[18%] top-[2%] md:left-[26%] md:top-[4%]"
        />

        <ElegantShape
          delay={0.6}
          width={980}
          height={190}
          rotate={-8}
          gradient="from-rose-400/[0.11]"
          className="right-[-42%] bottom-[4%] md:right-[-6%] md:bottom-[8%]"
        />

        <ElegantShape
          delay={0.7}
          width={540}
          height={120}
          rotate={-7}
          gradient="from-violet-400/[0.11]"
          className="bottom-[7%] left-[-12%] md:bottom-[8%] md:left-[10%]"
        />
      </div>

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-6xl text-center">
          <motion.div
            custom={0}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="mb-10 inline-flex items-center gap-3 rounded-full border border-white/[0.12] bg-white/[0.04] px-5 py-2 shadow-[0_0_30px_rgba(255,255,255,0.06)] backdrop-blur-md md:mb-20"
          >
            <Circle className="h-3 w-3 fill-rose-500/90 text-rose-300" />
            <span className="text-base tracking-wide text-white/60 md:text-lg">
              {badge}
            </span>
          </motion.div>

          <motion.div
            custom={1}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
          >
            <h1 className="mx-auto mb-7 max-w-6xl text-5xl leading-[0.9] font-black tracking-tight sm:text-7xl md:mb-10 md:text-[8.7rem] lg:text-[10.5rem]">
              <span className="bg-gradient-to-b from-white to-white/80 bg-clip-text text-transparent">
                {title1}
              </span>
              <br />
              <span
                className={cn(
                  "bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300 bg-clip-text text-transparent"
                )}
              >
                {title2}
              </span>
            </h1>
          </motion.div>

          <motion.div
            custom={2}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
          >
            <p className="mx-auto mb-8 max-w-4xl px-4 text-lg leading-relaxed font-light tracking-wide text-white/40 sm:text-2xl md:text-4xl">
              {description}
            </p>
          </motion.div>

          {ctaLabel ? (
            <motion.div
              custom={3}
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
            >
              <button
                type="button"
                onClick={onCtaClick}
                className="inline-flex h-12 items-center justify-center gap-3 rounded-full border border-white/15 bg-white px-7 text-sm font-black tracking-[0.14em] text-[#030303] uppercase shadow-[0_20px_80px_rgba(255,255,255,0.12)] transition hover:-translate-y-0.5 hover:bg-rose-100"
              >
                {ctaLabel}
                <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          ) : null}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_38%,rgba(0,0,0,0.78)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/85" />
    </div>
  )
}

export { HeroGeometric }
