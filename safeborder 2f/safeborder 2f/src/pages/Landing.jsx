// src/pages/Landing.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-block h-6 w-6 rounded-md bg-[#5D6B8A]" />
            <span className="font-bold">SafeBorder AI</span>
          </div>

        {/* زر واحد فقط */}
          <Link
            to="/login"
            className="inline-flex h-10 items-center rounded px-4 text-white font-bold bg-[#5D6B8A] hover:bg-[#4B5673] transition-colors"
          >
            Connexion
          </Link>
        </div>
      </header>

      <main>
        {/* Hero مع قوس الخلفية */}
{/* Hero مع قوس الخلفية */}
{/* HERO — même texte, juste l’arc ajusté comme la 2e image */}
<section className="relative overflow-hidden bg-white">
  {/* ARC gris en arrière-plan */}
  <div className="absolute inset-0 z-0 pointer-events-none">
 <svg
    className="pointer-events-none absolute top-[-200px] left-0 w-full h-[800px] -z-10"
    viewBox="0 0 1440 500"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M-200 448.5C118.5 531 522.5 448.5 720.5 241C918.5 33.5 1204 -103.5 1640 94"
      stroke="#E9EDF3"
      strokeWidth="100"
      strokeLinecap="round"
    />
  </svg>
  </div>

  {/* CONTENU au-dessus de l’arc */}
  <div className="relative z-10 mx-auto max-w-6xl px-4 py-16 md:py-20 text-center">
    <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight">
      Smarter, Safer Borders — <span className="whitespace-pre"> </span>
      in Real Time.
    </h1>

    <p className="mt-4 text-base md:text-lg text-slate-600 max-w-3xl mx-auto">
      SafeBorder AI transforme la vidéo en direct en informations
      actionnables avec une détection respectueuse de la vie privée
      et une sécurité de niveau institutionnel pour la protection
      des frontières et des eaux territoriales.
    </p>
  </div>
</section>




        {/* Fonctionnalités clés */}
        <section className="bg-[#F7F8FB] py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center">
              Fonctionnalités clés
            </h2>
            <p className="mt-4 text-center text-slate-600 max-w-3xl mx-auto">
              Les piliers qui permettent une conscience situationnelle fiable
              et un contrôle opérationnel continu.
            </p>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {/* Carte 1 */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="h-10 w-10 rounded-md bg-[#5D6B8A]/20 flex items-center justify-center">
                  {/* camera */}
                  <svg
                    className="h-6 w-6 text-[#5D6B8A]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M3 7h12a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H3z" />
                    <path d="M17 10l4-2v8l-4-2z" />
                    <circle cx="8.5" cy="12" r="2.5" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-bold">Détection en temps réel</h3>
                <p className="mt-2 text-slate-600 text-sm">
                  Analyse vidéo avec reconnaissance d’objets et score de risque
                  dynamique pour signaler rapidement les événements critiques.
                </p>
              </div>

              {/* Carte 2 */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="h-10 w-10 rounded-md bg-[#5D6B8A]/20 flex items-center justify-center">
                  {/* shield */}
                  <svg
                    className="h-6 w-6 text-[#5D6B8A]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M12 3l7 4v6c0 4-3 7-7 8-4-1-7-4-7-8V7l7-4z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-bold">Sécurité &amp; traçabilité</h3>
                <p className="mt-2 text-slate-600 text-sm">
                  Authentification par rôles, journaux infalsifiables et
                  chiffrement bout-à-bout pour protéger vos opérations et vos données.
                </p>
              </div>

              {/* Carte 3 */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="h-10 w-10 rounded-md bg-[#5D6B8A]/20 flex items-center justify-center">
                  {/* map */}
                  <svg
                    className="h-6 w-6 text-[#5D6B8A]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M9 3l6 2 6-2v18l-6 2-6-2-6 2V5z" />
                    <path d="M9 3v18M15 5v18" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-bold">Carte opérationnelle</h3>
                <p className="mt-2 text-slate-600 text-sm">
                  Carte multi-couches (zones, météo, chaleur) pour situer caméras,
                  incidents et rapports citoyens au même endroit.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Comment ça marche */}
{/* Comment ça marche */}
<section className="py-16 md:py-20">
  <div className="mx-auto max-w-6xl px-4">
    <h2 className="text-3xl md:text-4xl font-bold text-center">
      Comment ça marche
    </h2>

    {/* جعل القسم عمودين: اليسار الخطوات، اليمين الأنيميشن */}
    <div className="mt-10 grid gap-10 md:grid-cols-2 items-start">
      {/* العمود الأيسر: الخطوات كما هي */}
      <div className="grid grid-cols-[auto_1fr] gap-x-6">
        {/* 1 */}
        <div className="flex flex-col items-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#5D6B8A] text-[#5D6B8A] font-semibold">
            1
          </span>
          <span className="w-px grow bg-slate-300" />
        </div>
        <div className="pb-10">
          <p className="text-lg font-semibold">Collecter</p>
          <p className="text-slate-600">
            Flux vidéo et données IoT sont agrégés depuis caméras réelles
            ou de simulation et préparés pour l’analyse.
          </p>
        </div>

        {/* 2 */}
        <div className="flex flex-col items-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#5D6B8A] text-[#5D6B8A] font-semibold">
            2
          </span>
          <span className="w-px grow bg-slate-300" />
        </div>
        <div className="pb-10">
          <p className="text-lg font-semibold">Détecter</p>
          <p className="text-slate-600">
            Le modèle IA identifie objets/événements et calcule un score de
            risque pour prioriser la réponse.
          </p>
        </div>

        {/* 3 */}
        <div className="flex flex-col items-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#5D6B8A] text-[#5D6B8A] font-semibold">
            3
          </span>
        </div>
        <div>
          <p className="text-lg font-semibold">Agir</p>
          <p className="text-slate-600">
            Alertes instantanées, escalade sécurisée et génération de rapports
            pour les équipes habilitées.
          </p>
        </div>
      </div>

      {/* العمود الأيمن: لوحة أنيميشن البحر + الأمان */}
      <div className="relative h-80 rounded-xl overflow-hidden border border-slate-200 bg-gradient-to-b from-white to-[#F7F8FB]">
        {/* درع نابض (رمز الأمان) */}
        <div className="absolute right-4 top-4">
          <div className="h-10 w-10 rounded-lg bg-[#5D6B8A]/10 flex items-center justify-center animate-pulse">
            <svg
              className="h-6 w-6 text-[#5D6B8A]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M12 3l7 4v6c0 4-3 7-7 8-4-1-7-4-7-8V7l7-4z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
        </div>

        {/* رادار يدور */}
        <div className="absolute left-8 top-8">
          <svg width="160" height="160" viewBox="0 0 160 160" className="opacity-80">
            <circle cx="80" cy="80" r="70" stroke="#5D6B8A22" strokeWidth="2" fill="none" />
            <circle cx="80" cy="80" r="48" stroke="#5D6B8A22" strokeWidth="2" fill="none" />
            <circle cx="80" cy="80" r="26" stroke="#5D6B8A22" strokeWidth="2" fill="none" />
            {/* الذراع الدوّار */}
            <g className="radar-sweep origin-center" style={{ transformOrigin: '80px 80px' }}>
              <line x1="80" y1="80" x2="140" y2="80" stroke="#5D6B8A" strokeWidth="2" />
              <path d="M80,80 L140,80 A60,60 0 0,1 80,20 Z"
                fill="url(#radarGradient)" opacity="0.25" />
            </g>
            <defs>
              <linearGradient id="radarGradient" x1="1" y1="0" x2="0" y2="0">
                <stop offset="0%" stopColor="#5D6B8A" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#5D6B8A" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* قارب يهتز برفق */}
        <div className="absolute left-1/2 -translate-x-1/2 top-28 boat-bob">
          <svg width="120" height="60" viewBox="0 0 120 60">
            {/* بدن القارب */}
            <path d="M10 40 L110 40 L95 55 L25 55 Z" fill="#5D6B8A" opacity="0.85" />
            {/* كابينة */}
            <rect x="45" y="22" width="28" height="18" rx="2" fill="#5D6B8A" />
            <rect x="50" y="26" width="8" height="8" fill="white" opacity="0.9" />
            <rect x="62" y="26" width="8" height="8" fill="white" opacity="0.9" />
            {/* هوائي */}
            <line x1="59" y1="22" x2="59" y2="12" stroke="#5D6B8A" strokeWidth="2" />
            <circle cx="59" cy="10" r="3" fill="#5D6B8A" />
          </svg>
        </div>

        {/* أمواج تتحرك أفقياً */}
        <svg className="absolute bottom-0 left-0 w-[140%] h-24 wave-move" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path
            d="M0,40 C120,80 240,0 360,40 C480,80 600,10 720,40 C840,70 960,15 1080,40 C1200,65 1320,25 1440,40 L1440,120 L0,120 Z"
            fill="#5D6B8A18"
          />
        </svg>
        <svg className="absolute bottom-0 left-0 w-[150%] h-24 wave-move-slow" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path
            d="M0,50 C120,90 240,10 360,50 C480,90 600,20 720,50 C840,80 960,25 1080,50 C1200,75 1320,35 1440,50 L1440,120 L0,120 Z"
            fill="#5D6B8A26"
          />
        </svg>
      </div>
    </div>
  </div>

  {/* مفاتيح الحركة (تعمل مع Tailwind بدون تعديل config) */}
  <style>{`
    @keyframes sweepRotate {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    .radar-sweep { animation: sweepRotate 6s linear infinite; }

    @keyframes boatBob {
      0%, 100% { transform: translate(-50%, 0px); }
      50%      { transform: translate(-50%, -6px); }
    }
    .boat-bob { animation: boatBob 2.8s ease-in-out infinite; }

    @keyframes waveMove {
      0%   { transform: translateX(0); }
      100% { transform: translateX(-10%); }
    }
    .wave-move      { animation: waveMove 12s linear infinite; }
    .wave-move-slow { animation: waveMove 18s linear infinite; opacity: .9; }
  `}</style>
</section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} SafeBorder AI. Tous droits réservés.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <a className="text-slate-500 hover:text-[#5D6B8A]" href="#">
              Mentions légales
            </a>
            <a className="text-slate-500 hover:text-[#5D6B8A]" href="#">
              Confidentialité
            </a>
            <a className="text-slate-500 hover:text-[#5D6B8A]" href="#">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
