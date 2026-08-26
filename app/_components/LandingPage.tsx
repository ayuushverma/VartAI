"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const particles = [
  ["12%", "18%", "2px", "9s"], ["28%", "34%", "3px", "13s"], ["44%", "12%", "2px", "11s"],
  ["62%", "27%", "3px", "15s"], ["78%", "14%", "2px", "10s"], ["91%", "42%", "2px", "14s"],
  ["17%", "67%", "2px", "16s"], ["72%", "73%", "3px", "12s"], ["52%", "82%", "2px", "17s"],
] as const;

const features = [
  ["01", "Speak", "Practice out loud in conversations that feel like real life.", "◌"],
  ["02", "Practice", "Choose a scenario, find your words, and keep the exchange moving.", "↗"],
  ["03", "Improve", "Get focused feedback that helps you sound more natural next time.", "✦"],
] as const;

const languages = [
  ["EN", "English", "English", "Available", "var(--blue)"],
  ["ES", "Spanish", "Español", "Available", "var(--coral)"],
] as const;

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
      });
    }, { threshold: 0.12 });
    document.querySelectorAll(".v-reveal").forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  function closeMenu() { setMenuOpen(false); }

  return (
    <main className="v-landing text-white">
      <div className="v-atmosphere" aria-hidden="true"><span className="v-cloud v-cloud-one" /><span className="v-cloud v-cloud-two" /><span className="v-cloud v-cloud-three" />{particles.map(([left, top, size, duration]) => <i className="v-particle" key={`${left}-${top}`} style={{ left, top, width: size, height: size, animationDuration: duration }} />)}</div>
      <header className="v-landing-nav">
        <Link className="v-brand" href="/" onClick={closeMenu}><span className="v-brand-mark">V</span>Vart<span>AI</span></Link>
        <button className="v-menu-button" aria-expanded={menuOpen} aria-controls="landing-nav" onClick={() => setMenuOpen(!menuOpen)} type="button"><span /><span /><span /><b className="sr-only">Open navigation</b></button>
        <nav className={`v-landing-links ${menuOpen ? "is-open" : ""}`} id="landing-nav">
          <a href="#how-it-works" onClick={closeMenu}>How it works</a><a href="#features" onClick={closeMenu}>Features</a><a href="#languages" onClick={closeMenu}>Languages</a><a href="#progress" onClick={closeMenu}>Progress</a>
          <Link className="v-nav-login" href="/login">Log in</Link><Link className="v-button v-nav-cta" href="/login">Start learning</Link>
        </nav>
      </header>

      <section className="v-landing-hero v-section-pad">
        <div className="v-hero-copy">
          <p className="v-landing-kicker v-enter-one">AI-powered language learning</p>
          <h1 className="v-landing-title v-enter-two">Speak with <em>confidence.</em><br />Learn through conversation.</h1>
          <p className="v-landing-lede v-enter-three">Practice real conversations with your personal AI tutor. Speak naturally, get instant feedback, and improve every day.</p>
          <div className="v-hero-actions v-enter-four"><Link className="v-button v-large-button" href="/login">Start learning free <span aria-hidden="true">→</span></Link><Link className="v-ghost-button" href="/login">Continue on Web</Link></div>
          <p className="v-app-note">iOS &amp; Android coming soon</p>
        </div>
        <div className="v-phone-stage v-enter-phone">
          <div className="v-ambient-glow" aria-hidden="true" />
          <div className="v-phone"><div className="v-phone-notch" /><div className="v-phone-top"><span>9:41</span><span>◒ ◒</span></div><p className="v-phone-greeting">Hi, learner <span>✦</span></p><p className="v-phone-subtitle">Ready for a little practice?</p><div className="v-phone-goal"><div><small>Daily goal</small><strong>12 / 20 XP</strong></div><span className="v-phone-ring">60%</span></div><small className="v-phone-label">Continue learning</small><div className="v-phone-scenario"><div><strong>Ordering at a café</strong><small>Everyday conversation</small></div><span>75%</span></div><small className="v-phone-label">Recent activity</small><div className="v-phone-activity"><p><b>◉</b> Conversation practice <strong>+20 XP</strong></p><p><b>◌</b> Pronunciation drill <strong>+15 XP</strong></p><p><b>✦</b> Vocabulary review <strong>+10 XP</strong></p></div><div className="v-phone-footer"><span>⌂<small>Home</small></span><span>◌<small>Practice</small></span><span>↗<small>Progress</small></span></div></div>
          <div className="v-float-card v-float-xp">+20 XP <small>conversation complete</small></div><div className="v-float-card v-float-streak">✦ 7 day streak</div><div className="v-float-card v-float-feedback">Great pronunciation!</div><div className="v-float-card v-float-listening"><span className="v-pulse-dot" /> Listening...</div>
        </div>
      </section>

      <section className="v-proof-strip"><span>Built for the moments when words matter</span><i /><span>Voice-enabled practice</span><i /><span>Feedback that stays useful</span></section>

      <section className="v-landing-section v-reveal" id="features"><p className="v-landing-kicker">A better practice loop</p><h2 className="v-section-title">Learning shouldn&apos;t feel like homework.</h2><p className="v-section-lede">VartAI turns language practice into conversations you actually want to have.</p><div className="v-feature-grid">{features.map(([number, title, text, icon]) => <article className="v-feature-card" key={number}><span className="v-feature-number">{number}</span><span className="v-feature-icon">{icon}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>

      <section className="v-landing-section v-how-section v-reveal" id="how-it-works"><div><p className="v-landing-kicker">A simple rhythm</p><h2 className="v-section-title">Three steps to a<br /><em>stronger voice.</em></h2></div><div className="v-step-list"><article><span>01</span><div><h3>Choose your goal</h3><p>Pick a situation that fits the conversation you want to have today.</p></div></article><article><span>02</span><div><h3>Start talking</h3><p>Use your voice or type naturally. There is no perfect first sentence.</p></div></article><article><span>03</span><div><h3>Get better every session</h3><p>Take away practical feedback, new vocabulary, and a little more confidence.</p></div></article></div></section>

      <section className="v-conversation-section v-reveal"><div className="v-conversation-intro"><p className="v-landing-kicker">Practice that feels real</p><h2 className="v-section-title">Turn words into<br /><em>momentum.</em></h2><p>VartAI meets you inside the conversation, with guidance that keeps you speaking instead of stopping you.</p><Link className="v-text-link" href="/login">Try a conversation <span>→</span></Link></div><div className="v-chat-demo"><div className="v-chat-meta"><span className="v-brand-mark">V</span><span>VartAI <small>conversation coach</small></span><b>● live</b></div><div className="v-chat-bubble v-chat-ai">You&apos;re checking into a hotel in Barcelona.</div><div className="v-chat-bubble v-chat-user">Hola, tengo una reserva para dos noches.</div><div className="v-chat-feedback"><span>✦</span><div><strong>Nice start.</strong><p>Try: &quot;Tengo una reserva a mi nombre.&quot;</p><div><b>Grammar</b><b>Vocabulary</b><b>Confidence</b></div></div></div></div></section>

      <section className="v-voice-section v-reveal"><div className="v-voice-copy"><p className="v-landing-kicker">Speak naturally</p><h2 className="v-section-title">Talk naturally.<br /><em>VartAI listens.</em></h2><p>Practice pronunciation, rhythm, and confidence with voice input that lets you stay in the flow.</p></div><div className="v-voice-console"><div className="v-voice-status"><span className="v-pulse-dot" /> Listening</div><div className="v-waveform">{Array.from({ length: 28 }, (_, index) => <i key={index} style={{ animationDelay: `${index * 45}ms`, height: `${18 + ((index * 17) % 44)}px` }} />)}</div><div className="v-voice-states"><span><b>◉</b> Listening</span><span><b>✦</b> Thinking</span><span><b>◒</b> Speaking</span></div></div></section>

      <section className="v-landing-section v-reveal" id="languages"><div className="v-section-heading-row"><div><p className="v-landing-kicker">Your pace, your path</p><h2 className="v-section-title">One goal.<br /><em>Many languages.</em></h2></div><p className="v-section-lede">Start where you are. More languages will join the studio as VartAI grows.</p></div><div className="v-language-grid">{languages.map(([code, name, native, status, color]) => <article key={code} className="v-language-card"><span style={{ background: color }}>{code}</span><div><h3>{name}</h3><p>{native}</p></div><small>{status}</small></article>)}<article className="v-language-card v-language-soon"><span>+</span><div><h3>More languages</h3><p>Coming soon</p></div><small>Stay tuned</small></article></div></section>

      <section className="v-profile-section v-reveal" id="progress"><div className="v-profile-card"><div className="v-profile-top"><span className="v-profile-avatar">A2</span><div><p className="v-landing-kicker">Example learner path</p><h3>Travel confidently</h3></div><span className="v-profile-level">A2 level</span></div><div className="v-profile-progress"><div><span>Conversation confidence</span><strong>68%</strong></div><div className="v-progress-track"><i /></div></div><div className="v-profile-tags"><span>Conversation</span><span>Vocabulary</span><span>Pronunciation</span></div></div><div className="v-profile-copy"><p className="v-landing-kicker">Personalized by practice</p><h2 className="v-section-title">Your learning path<br />is <em>yours.</em></h2><p>VartAI notices what helps you improve and shapes the next conversation around it. No two practice paths need to look the same.</p></div></section>

      <section className="v-gamification-section v-reveal"><div><p className="v-landing-kicker">Small wins, carried forward</p><h2 className="v-section-title">Make progress<br /><em>visible.</em></h2><p>Every completed conversation contributes to your real learning history, daily goal, streak, and milestones.</p></div><div className="v-stats-grid"><div><span>✦</span><strong>+40</strong><small>XP earned</small></div><div><span>◒</span><strong>7</strong><small>day streak</small></div><div><span>◉</span><strong>1 / 1</strong><small>daily goal</small></div><div><span>↗</span><strong>03</strong><small>milestones</small></div></div></section>

      <section className="v-difference-section v-reveal"><p className="v-landing-kicker">The VartAI difference</p><h2>Don&apos;t just learn a language.<br /><em>Use it.</em></h2><p>Turn vocabulary into conversations and conversations into confidence.</p></section>

      <section className="v-final-cta v-reveal"><div className="v-final-grid" aria-hidden="true" /><p className="v-landing-kicker">Your next conversation is one tap away</p><h2>Ready to start<br /><em>speaking?</em></h2><div className="v-hero-actions"><Link className="v-button v-large-button" href="/login">Start learning free <span aria-hidden="true">→</span></Link><Link className="v-ghost-button" href="/login">Continue on Web</Link></div><p className="v-app-note">iOS &amp; Android coming soon</p></section>

      <footer className="v-landing-footer"><div><Link className="v-brand" href="/"><span className="v-brand-mark">V</span>Vart<span>AI</span></Link><p>Your AI language tutor for real conversations.</p></div><div><small>Product</small><a href="#features">Features</a><a href="#how-it-works">How it works</a><Link href="/practice">Practice</Link><Link href="/progress">Progress</Link></div><div><small>Studio</small><a href="#languages">Languages</a><a href="#progress">Your path</a><Link href="/login">Log in</Link><Link href="/signup">Create account</Link></div><div><small>Stay connected</small><p className="v-footer-note">New practice ideas and product updates, coming soon.</p></div></footer>
    </main>
  );
}
