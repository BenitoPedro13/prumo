"use client";

import { type CSSProperties, type PointerEvent, useEffect, useRef } from "react";

import { BRAND_NAME } from "@/lib/site-config";
import { cn } from "@/lib/utils";

/**
 * The plumb apparatus — docs/design-handoff.md §07, after
 * docs/design/prototypes/pre-qualificacao.html.
 *
 * §07 calls it the page's mechanism rather than a logo applied to a page: it is the
 * pre-qualification's progress indicator, its result state, and — later — the proposal's
 * payment timeline. It is also the only thing on the whole site that can be touched, so it is
 * simulated rather than animated.
 *
 * What runs underneath is a rope: sixteen points, Verlet-integrated, held together by distance
 * constraints, pinned at the anchor and weighted at the bob. Nothing here is keyframed. The
 * behaviour comes out of the rope:
 *
 *   Answering lets rope out. The line pays out over a beat, the bob falls behind it, the slack
 *   takes up from the top down, and the whole assembly swings and settles.
 *
 *   Going back reels rope in, so the line goes slack, bellies out, and gathers itself.
 *
 *   The swing slows as the line lengthens, because that is what a pendulum does, and a long
 *   rope carries the wave down it rather than turning as one rigid piece.
 *
 *   Brushing past it makes it ripple from the point touched. Picking the bob up moves the rope
 *   with the hand — lift it and it goes slack, pull past its length and it will not stretch,
 *   let go and it falls from where it was at the speed it was moving.
 *
 * Two things it will not do, because a plumb line cannot:
 *
 *   The line never hangs at an angle of its own accord. Gravity is what makes the instrument
 *   work. What "fora do prumo" tilts is the mark — the face of the wall being measured —
 *   because that is the only thing a plumb can report: the gap that opens between the line and
 *   the face on the way down. The prototype tilted the thread instead, which draws a plumb
 *   line that cannot exist, on the one screen whose whole claim is that it tells the truth.
 *
 *   It does not move at all under prefers-reduced-motion. The bob is placed on its notch by
 *   CSS and stays there, and none of the above ever starts.
 */

export type PlumbState = "hanging" | "aligned" | "crooked";

type PlumbRailProps = {
  /** Total notches; the flow's step count. */
  notches: number;
  /** Which notch the bob currently rests on, 0-indexed. */
  current: number;
  /** The bob's reading. "hanging" while the flow runs. */
  state?: PlumbState;
  /** What the progress is progress through. The verdict is never announced here. */
  label?: string;
  className?: string;
};

/**
 * Where the bob's travel starts and stops, measured from the top and the bottom of the rail.
 * The bottom reserve keeps the bob clear of the rail cap, which is 76px tall and sits 12px from
 * the floor. CSS owns the resting layout and the simulation borrows it, so the same two numbers
 * appear once as a calc and once as pixels.
 */
const TRAVEL = "calc(3rem + (100% - 10rem) * var(--plumb-p))";
const TRAVEL_TOP = 48;
const TRAVEL_RESERVE = 160;

/** The resting path only: reduced motion, the first paint, and every frame nothing is moving. */
const THREAD_MOTION =
  "[transition:height_780ms_var(--ease-drop),background-color_500ms_var(--ease-prumo)]";
const BOB_MOTION = "[transition:top_780ms_var(--ease-drop),color_500ms_var(--ease-prumo)]";

/**
 * Aligned draws the line taut over a face that is dead vertical — line and face become one,
 * which is the whole reading. Crooked leans the face away and turns the plumb to brass. Brass
 * and never red: not being ready yet is guidance, not a rejection (design-handoff.md §03).
 *
 * The lean is a share of the rail's width rather than an angle, so it draws the same gap at the
 * foot whether the rail is 36px wide on a phone or 50px on a desktop.
 */
const FACE_LEAN = 74;

const THREAD_STATE: Record<PlumbState, string> = {
  hanging: "bg-verde-ink/50",
  aligned: "bg-verde-ink/92",
  crooked: "bg-latao-ink/70",
};

/** The same three for the simulated rope, which is a curve and so is stroked, not boxed. */
const ROPE_STATE: Record<PlumbState, string> = {
  hanging: "stroke-verde-ink/50",
  aligned: "stroke-verde-ink/92",
  crooked: "stroke-latao-ink/70",
};

const BOB_STATE: Record<PlumbState, string> = {
  hanging: "text-verde-ink",
  aligned: "text-verde-ink",
  crooked: "text-latao-ink",
};

/*
  The rope.

  GRAVITY is not 9.81 m/s² scaled to pixels: the rail is a drawing, not a window, and this is
  the value at which a line the height of a phone screen falls and swings at a pace that reads
  as a weight on a string rather than a cursor blinking.

  KNOTS is how many points the rope is made of — enough for a belly and a travelling wave, few
  enough that the whole solve is a rounding error. STIFFNESS is how much of each distance error
  is taken out per pass, and PASSES how many times; together they are why the rope does not
  stretch. HEAVY is the bob's share of a correction: a fifth, so the rope moves around it and it
  reads as the mass in the system.

  PAY_OUT is how fast rope is let out or gathered in when the notch changes — a hand's pace, not
  a jump. SWAY caps what the apparatus does to itself, because the rail is 36px wide on a phone;
  a hand is allowed to pull the bob out of it, a falling notch is not.
*/
const GRAVITY = 2400;
const KNOTS = 16;
const PASSES = 8;
const STIFFNESS = 0.86;
const HEAVY = 0.2;
const FRICTION = 0.994;
const PAY_OUT = 7.5;
const SWAY = 52;
const KICK_PER_PX = 0.5;
const KICK_FLOOR = 34;
const BRUSH_REACH = 34;
const BRUSH_FORCE = 0.28;
const TICK = 1 / 120;
const ASLEEP = 0.06;

type Knot = { x: number; y: number; px: number; py: number };

type Rig = {
  rail: HTMLElement;
  rope: SVGPathElement;
  thread: HTMLElement;
  bob: HTMLElement;
};

/**
 * A rope hanging from the top centre of the rail, in the rail's own pixels.
 *
 * It writes transforms and a path directly to the DOM: sixteen points at 120Hz is not something
 * React should be asked to re-render, and none of it is state the rest of the page can read.
 */
function ropeOn({ rail, rope, thread, bob }: Rig) {
  const knots: Knot[] = [];
  let length = 0;
  let target = 0;
  let holding = false;
  let running = false;
  let frame = 0;
  let clock = 0;
  let carry = 0;

  const anchorX = () => rail.clientWidth / 2;

  /** Lay the rope out straight, the way CSS has it drawn right now. */
  function lay(to: number) {
    length = to;
    target = to;
    knots.length = 0;

    for (let i = 0; i < KNOTS; i++) {
      const y = (to * i) / (KNOTS - 1);
      knots.push({ x: anchorX(), y, px: anchorX(), py: y });
    }
  }

  function simulate() {
    const gravity = GRAVITY * TICK * TICK;

    for (let i = 1; i < KNOTS; i++) {
      const knot = knots[i];
      if (holding && i === KNOTS - 1) continue;

      const vx = (knot.x - knot.px) * FRICTION;
      const vy = (knot.y - knot.py) * FRICTION;
      knot.px = knot.x;
      knot.py = knot.y;
      knot.x += vx;
      knot.y += vy + gravity;
    }

    // Rope is let out and gathered in at a hand's pace, never in one frame.
    length += (target - length) * Math.min(1, PAY_OUT * TICK);

    const rest = length / (KNOTS - 1);
    const pinned = KNOTS - 1;

    for (let pass = 0; pass < PASSES; pass++) {
      knots[0].x = anchorX();
      knots[0].y = 0;

      for (let i = 0; i < KNOTS - 1; i++) {
        const a = knots[i];
        const b = knots[i + 1];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const span = Math.hypot(dx, dy) || 0.0001;
        const pull = ((span - rest) / span) * STIFFNESS;

        // The anchor never moves, a held bob never moves, and the bob is heavy.
        let mineA = i === 0 ? 0 : i + 1 === pinned ? 1 - HEAVY : 0.5;
        let mineB = i + 1 === pinned ? (holding ? 0 : HEAVY) : i === 0 ? 1 : 0.5;
        const total = mineA + mineB || 1;
        mineA /= total;
        mineB /= total;

        a.x += dx * pull * mineA;
        a.y += dy * pull * mineA;
        b.x -= dx * pull * mineB;
        b.y -= dy * pull * mineB;
      }
    }
  }

  /** One path through the knots, smoothed, plus the bob at the end of it, hanging along it. */
  function draw() {
    let d = `M ${knots[0].x.toFixed(2)} ${knots[0].y.toFixed(2)}`;
    for (let i = 1; i < KNOTS - 1; i++) {
      const knot = knots[i];
      const next = knots[i + 1];
      d += ` Q ${knot.x.toFixed(2)} ${knot.y.toFixed(2)} ${((knot.x + next.x) / 2).toFixed(2)} ${((knot.y + next.y) / 2).toFixed(2)}`;
    }
    const end = knots[KNOTS - 1];
    d += ` L ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
    rope.setAttribute("d", d);

    const above = knots[KNOTS - 2];
    const angle = Math.atan2(end.x - above.x, end.y - above.y);

    bob.style.translate = `${(end.x - anchorX()).toFixed(2)}px ${(end.y - target).toFixed(2)}px`;
    bob.style.rotate = `${((angle * 180) / Math.PI).toFixed(2)}deg`;
  }

  /** Give the layout back to CSS, so a resize or a re-render is not fighting stale pixels. */
  function sleep() {
    cancelAnimationFrame(frame);
    running = false;
    clock = 0;
    carry = 0;
    rope.style.opacity = "0";
    thread.style.opacity = "";
    thread.style.transitionProperty = "";
    bob.style.translate = "";
    bob.style.rotate = "";
    bob.style.transitionProperty = "";
    rail.style.overflow = "";
  }

  function restless() {
    if (Math.abs(target - length) > 0.4) return true;

    for (let i = 1; i < KNOTS; i++) {
      if (Math.hypot(knots[i].x - knots[i].px, knots[i].y - knots[i].py) > ASLEEP) return true;
    }

    return false;
  }

  const tick = (now: number) => {
    const elapsed = clock ? Math.min((now - clock) / 1000, 1 / 20) : TICK;
    clock = now;
    carry += elapsed;

    while (carry >= TICK) {
      simulate();
      carry -= TICK;
    }

    draw();

    if (!holding && !restless()) {
      sleep();
      return;
    }

    frame = requestAnimationFrame(tick);
  };

  function wake() {
    if (running) return;
    running = true;
    clock = 0;
    carry = 0;

    /*
      The transitions belong to the resting path; against a position written every frame they
      would only smear it. The colour transitions stay, because those belong to the state rather
      than to the movement.
    */
    thread.style.transitionProperty = "background-color";
    bob.style.transitionProperty = "color";
    thread.style.opacity = "0";
    rope.style.opacity = "1";
    frame = requestAnimationFrame(tick);
  }

  return {
    /** The rope the CSS has drawn, in case nothing has run yet. */
    ready(at: number) {
      if (knots.length === 0) lay(at);
    },
    /**
     * The notch moved: let rope out, or gather it in.
     *
     * The nudge that comes with it is not the fall — a bob dropped straight down would hang
     * straight down. It is the hand paying the line out, which never does it perfectly
     * plumb, so it lands along the rope rather than on the bob alone and the lower half
     * carries most of it. That is what makes the line wave rather than pivot.
     */
    reach(to: number, kick: number) {
      this.ready(to);
      target = to;

      for (let i = 1; i < KNOTS; i++) {
        const share = i / (KNOTS - 1);
        knots[i].px = knots[i].x - kick * share * share * TICK;
      }

      wake();
    },
    /** A hand passing across the line: whichever part of it was touched takes the push. */
    brush(at: { x: number; y: number }, force: number) {
      if (holding) return;

      let nearest = -1;
      let best = BRUSH_REACH;
      for (let i = 1; i < KNOTS; i++) {
        const gap = Math.hypot(knots[i].x - at.x, knots[i].y - at.y);
        if (gap < best) {
          best = gap;
          nearest = i;
        }
      }
      if (nearest < 0) return;

      const share = 1 - best / BRUSH_REACH;
      knots[nearest].px -= force * share * TICK;
      wake();
    },
    /** Where the bob is, so a hand can take hold of it without it jumping to the finger. */
    at() {
      const end = knots[KNOTS - 1];

      return { x: end.x, y: end.y };
    },
    /** Picked up. The bob goes where the hand goes, as far as the rope allows. */
    take(to: { x: number; y: number }) {
      if (!holding) {
        holding = true;
        rail.style.overflow = "visible";
        wake();
      }

      const end = knots[KNOTS - 1];
      const dx = to.x - anchorX();
      const dy = to.y;
      const span = Math.hypot(dx, dy);
      const reach = target;

      end.px = end.x;
      end.py = end.y;

      if (span > reach && span > 0) {
        end.x = anchorX() + (dx / span) * reach;
        end.y = (dy / span) * reach;
      } else {
        end.x = to.x;
        end.y = to.y;
      }
    },
    /** Let go. Verlet already knows how fast the hand was moving. */
    letGo() {
      if (!holding) return;
      holding = false;
      rail.style.overflow = "";
      wake();
    },
    still() {
      holding = false;
      sleep();
    },
    /** True while the rail is the simulation's to draw. */
    awake: () => running,
  };
}

const clamp = (value: number, limit: number) => Math.max(-limit, Math.min(limit, value));

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function PlumbRail({
  notches,
  current,
  state = "hanging",
  label = "Progresso",
  className,
}: PlumbRailProps) {
  const rail = useRef<HTMLDivElement>(null);
  const thread = useRef<HTMLSpanElement>(null);
  const bob = useRef<HTMLSpanElement>(null);
  const line = useRef<SVGPathElement>(null);
  const plumb = useRef<ReturnType<typeof ropeOn> | null>(null);
  const previous = useRef<number | null>(null);
  const hand = useRef<{ x: number; y: number } | null>(null);
  const brush = useRef<{ x: number; at: number } | null>(null);

  const span = Math.max(notches - 1, 1);
  const notch = Math.min(Math.max(current, 0), span);
  const p = notch / span;

  useEffect(() => {
    if (!rail.current || !thread.current || !bob.current || !line.current) return;

    const instrument = ropeOn({
      rail: rail.current,
      rope: line.current,
      thread: thread.current,
      bob: bob.current,
    });
    plumb.current = instrument;

    return () => {
      instrument.still();
      plumb.current = null;
    };
  }, []);

  /*
    A notch is a disturbance, so the rope needs its size: how much line was let out, or taken
    back. It compares against the previous notch rather than a mounted flag, because in
    development effects run twice and a flag lets the second run drop a bob that has not moved.

    Under reduced motion nothing is simulated. The bob still arrives at the right notch — CSS
    puts it there — it simply arrives without the fall and without the swing.
  */
  useEffect(() => {
    const before = previous.current;
    previous.current = notch;

    const rope = ropeFor(rail.current, notch, span);
    plumb.current?.ready(rope);

    if (before === null || before === notch || !plumb.current) return;

    if (reduced()) {
      plumb.current.still();
      return;
    }

    /*
      The floor matters more than the scale: a notch on a short rail is barely twenty pixels of
      rope, and a nudge proportional to that is a nudge nobody sees. A hand letting line out is
      about as steady whether it lets out a little or a lot.
    */
    const dropped = rope - ropeFor(rail.current, before, span);
    const hand = Math.max(Math.abs(dropped) * KICK_PER_PX, KICK_FLOOR);

    plumb.current.reach(rope, clamp(Math.sign(dropped || 1) * hand, SWAY));
  }, [notch, span]);

  /** Pointer position in the rail's own pixels, where the anchor sits at (width / 2, 0). */
  function localTo(event: PointerEvent) {
    const box = rail.current?.getBoundingClientRect();

    return { x: event.clientX - (box?.left ?? 0), y: event.clientY - (box?.top ?? 0) };
  }

  /*
    Taking hold of something does not move it. The offset between the finger and the bob is kept
    for the length of the drag, so a thumb landing anywhere on the target picks the bob up where
    it is rather than snatching it to the middle of the touch.
  */
  function grab(event: PointerEvent<HTMLSpanElement>) {
    if (!plumb.current || reduced()) return;

    const pointer = localTo(event);
    const bobAt = plumb.current.at();

    event.currentTarget.setPointerCapture(event.pointerId);
    hand.current = { x: bobAt.x - pointer.x, y: bobAt.y - pointer.y };
    plumb.current.take(bobAt);
  }

  function pull(event: PointerEvent<HTMLSpanElement>) {
    const held = hand.current;
    if (!held || !plumb.current) return;

    const pointer = localTo(event);
    plumb.current.take({ x: pointer.x + held.x, y: pointer.y + held.y });
  }

  function letGo() {
    if (!hand.current) return;
    hand.current = null;
    plumb.current?.letGo();
  }

  /*
    A hand passing over the line rather than holding it. The push is the pointer's own sideways
    speed and it lands on the nearest stretch of rope, so brushing the middle of the line sends
    a wave down it and brushing near the bob swings the bob.
  */
  function passBy(event: PointerEvent<HTMLDivElement>) {
    if (hand.current || !plumb.current || reduced()) return;

    const was = brush.current;
    const now = { x: event.clientX, at: event.timeStamp };
    brush.current = now;
    if (!was) return;

    const dt = (now.at - was.at) / 1000;
    if (dt <= 0 || dt > 0.12) return;

    plumb.current.brush(localTo(event), clamp(((now.x - was.x) / dt) * BRUSH_FORCE, SWAY));
  }

  return (
    <div
      ref={rail}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={span}
      aria-valuenow={notch}
      onPointerMove={passBy}
      onPointerLeave={() => (brush.current = null)}
      style={{ "--plumb-p": p } as CSSProperties}
      className={cn(
        "relative h-full min-h-64 w-9 overflow-hidden bg-verde-deep sm:w-[3.125rem]",
        className,
      )}
    >
      {/* The face being measured, held against the plumb at the top. True, it runs straight
          down and the line covers it; out of true, it leans away and the gap between the two is
          the reading. Drawn corner to corner in a stretched viewBox so the lean stays
          proportional to the rail at any height. */}
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <line
          x1="50"
          y1="0"
          x2={state === "crooked" ? FACE_LEAN : 50}
          y2="100"
          vectorEffect="non-scaling-stroke"
          className="stroke-verde-ink/20"
        />
      </svg>

      {/* The rope while it is moving. No viewBox, so one unit is one pixel of rail — which is
          what the simulation thinks in. */}
      <svg aria-hidden className="absolute inset-0 h-full w-full overflow-visible">
        <path
          ref={line}
          fill="none"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
          className={cn("opacity-0", ROPE_STATE[state])}
        />
      </svg>

      {/* The rope while nothing is moving: one hairline, laid out by CSS, so the rail is right
          on the first paint and under reduced motion. */}
      <span
        ref={thread}
        style={{ height: TRAVEL }}
        className={cn(
          "absolute top-0 left-1/2 block w-px -translate-x-1/2",
          THREAD_MOTION,
          THREAD_STATE[state],
        )}
      />

      <span
        ref={bob}
        style={{ top: TRAVEL }}
        className={cn(
          "absolute left-1/2 -ml-[7.5px] block w-[15px] [transform-origin:50%_0]",
          BOB_MOTION,
          BOB_STATE[state],
        )}
      >
        <svg viewBox="0 0 30 46" className="block w-full" aria-hidden>
          <path d="M15 0 L26 16 L15 44 L4 16 Z" fill="currentColor" />
        </svg>

        {/* The bob is 15px of drawing, which is not a target. This is the hand-sized one. */}
        <span
          onPointerDown={grab}
          onPointerMove={pull}
          onPointerUp={letGo}
          onPointerCancel={letGo}
          onLostPointerCapture={letGo}
          className="absolute -inset-x-6 -top-4 -bottom-4 cursor-grab touch-none active:cursor-grabbing"
        />
      </span>

      {/*
        Physical properties only. `inset-x-*` is `inset-inline` and `mx-auto` is
        `margin-inline`, and the inline axis of a vertical-rl box runs top to bottom — written
        the usual way, the two of them pin this to the rail's top and bottom and centre it in
        the middle of the rail instead of standing it at the foot.
      */}
      <span
        aria-hidden
        className="absolute right-0 bottom-3 left-0 mr-auto ml-auto h-[76px] text-center font-mono text-[8px] tracking-[0.14em] text-verde-ink/35 uppercase [writing-mode:vertical-rl]"
      >
        {BRAND_NAME}
      </span>
    </div>
  );
}

/** The rope a notch calls for, in pixels — the same numbers TRAVEL puts into CSS. */
function ropeFor(rail: HTMLElement | null, at: number, span: number) {
  const height = rail?.clientHeight ?? 0;

  return TRAVEL_TOP + Math.max(height - TRAVEL_RESERVE, 0) * (at / span);
}
