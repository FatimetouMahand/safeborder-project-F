// src/features/auth/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function Login() {
  const [flipped, setFlipped] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);

  // Login state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Signup state
  const [suName, setSuName] = useState("");
  const [suUsername, setSuUsername] = useState("");
  const [suEmail, setSuEmail] = useState("");
  const [suPwd1, setSuPwd1] = useState("");
  const [suPwd2, setSuPwd2] = useState("");
  const [role, setRole] = useState("");
  const [signupError, setSignupError] = useState("");

  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  /** ---------------- LOGIN ---------------- */
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const result = await authLogin(username, password);
      
      if (result.success) {
        console.log("✅ Login OK:", result);
        
        // 🔥 Attendre un court instant pour que le contexte soit mis à jour
        setTimeout(() => {
          const userRole = result.role || result.user?.user_type;
          
          if (userRole === "admin") {
            navigate("/admin/media");
          } else if (userRole === "simulation") {
            navigate("/simulator");
          } else if (userRole === "fisherman") {
            navigate("/fisherman/dashboard");
          } else {
            navigate("/");
          }
        }, 100); // 🔥 Petit délai pour la synchronisation
      } else {
        setLoginError("❌ Nom d'utilisateur ou mot de passe invalide");
      }
    } catch (err) {
      console.error("Login error:", err);
      setLoginError("❌ Erreur lors de la connexion");
    } finally {
      setLoginLoading(false);
    }
  };

  /** ---------------- SIGNUP ---------------- */
  const handleSignup = async (e) => {
    e.preventDefault();
    setSignupError("");

    if (suPwd1 !== suPwd2) {
      setSignupError("Les mots de passe ne correspondent pas");
      return;
    }
    if (!role) {
      setSignupError("Veuillez choisir un rôle");
      return;
    }

    setSignupLoading(true);

    try {
      const payload = {
        username: suUsername,
        email: suEmail,
        password: suPwd1,
        confirm_password: suPwd2,
        first_name: suName,
        user_type: role,
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"}/api/auth/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Erreur lors de l'inscription");
      }

      console.log("✅ Signup OK:", data);
      alert("✅ Compte créé avec succès !");
      setFlipped(false);
      // Réinitialiser le formulaire
      setSuName("");
      setSuUsername("");
      setSuEmail("");
      setSuPwd1("");
      setSuPwd2("");
      setRole("");
    } catch (err) {
      console.error("Signup error:", err);
      setSignupError(err.message || "❌ Erreur lors de l'inscription");
    } finally {
      setSignupLoading(false);
    }
  };

  /* ======= DESIGN (inchangé) ======= */
  const COLORS = {
    bg: "#FFFFFF",
    light: "#F1F5F9",
    text: "#475569",
    border: "#E2E8F0",
    darkText: "#0F172A",
  };

  const cardStyle = {
    width: 800,
    height: 500,
    perspective: "2000px",
    borderRadius: 12,
    boxShadow:
      "0 8px 28px rgba(15,23,42,0.08), 0 12px 48px rgba(15,23,42,0.06)",
    overflow: "hidden",
    backgroundColor: "transparent",
  };

  const innerStyle = {
    width: "100%",
    height: "100%",
    position: "relative",
    transformStyle: "preserve-3d",
    transition: "transform 0.7s ease-in-out",
    transform: flipped ? "rotateY(180deg)" : "none",
    borderRadius: 12,
  };

  const faceBase = {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    backfaceVisibility: "hidden",
    display: "flex",
    flexDirection: "row",
    borderRadius: 12,
    backgroundColor: COLORS.bg,
  };

  const textSide = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: 32,
    color: COLORS.darkText,
    backgroundColor: COLORS.bg,
  };

  const formSide = {
    flex: 1,
    backgroundColor: COLORS.light,
    padding: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    clipPath: "polygon(12% 0, 100% 0, 100% 100%, 0 100%)",
    borderLeft: `1px solid ${COLORS.border}`,
  };

  const backFace = {
    ...faceBase,
    transform: "rotateY(180deg)",
    flexDirection: "row-reverse",
  };

  const labelCls = "block text-sm mb-2";
  const inputCls = "w-full rounded-md px-4 py-2 border outline-none";
  const inputStyle = {
    borderColor: COLORS.border,
    color: COLORS.darkText,
    backgroundColor: "#FFFFFF",
  };

  const neutralBtn = "w-full rounded-md py-2 font-semibold transition";
  const neutralBtnStyle = {
    backgroundColor: COLORS.text,
    color: "#FFFFFF",
  };

  const ghostLink = {
    color: COLORS.text,
    textDecoration: "underline",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: COLORS.bg }}
    >
      <div style={cardStyle}>
        <div style={innerStyle}>
          {/* -------- FRONT : LOGIN -------- */}
          <div style={faceBase}>
            <div style={textSide}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 8,
                    backgroundColor: COLORS.text,
                  }}
                />
                <h1 style={{ fontWeight: 700, fontSize: 22 }}>SafeBorder AI</h1>
              </div>

              <h2 style={{ fontSize: 42, fontWeight: 800, marginTop: 12 }}>
                Bienvenue
              </h2>

              <p style={{ color: COLORS.text, marginTop: 8, maxWidth: 420 }}>
                Accès sécurisé au système SafeBorder AI.
              </p>
            </div>

            <div style={formSide}>
              <form
                onSubmit={handleLogin}
                style={{
                  width: "100%",
                  maxWidth: 360,
                  backgroundColor: "#FFFFFF",
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 12,
                  padding: 24,
                }}
              >
                <h3
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: COLORS.darkText,
                    marginBottom: 16,
                  }}
                >
                  Connexion
                </h3>

                {loginError && (
                  <div style={{
                    backgroundColor: "#FEE2E2",
                    color: "#DC2626",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    marginBottom: "16px",
                    fontSize: "14px",
                  }}>
                    {loginError}
                  </div>
                )}

                <label className={labelCls} style={{ color: COLORS.text }}>
                  Nom d'utilisateur
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                  className={inputCls}
                  style={inputStyle}
                  disabled={loginLoading}
                />

                <div style={{ height: 8 }} />

                <label className={labelCls} style={{ color: COLORS.text }}>
                  Mot de passe
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputCls}
                  style={inputStyle}
                  disabled={loginLoading}
                />

                <div style={{ height: 16 }} />
                <button
                  type="submit"
                  className={neutralBtn}
                  style={{
                    ...neutralBtnStyle,
                    opacity: loginLoading ? 0.7 : 1,
                    cursor: loginLoading ? "not-allowed" : "pointer",
                  }}
                  disabled={loginLoading}
                >
                  {loginLoading ? "Connexion..." : "Se connecter"}
                </button>

                <div
                  style={{
                    marginTop: 12,
                    fontSize: 14,
                    color: COLORS.text,
                    textAlign: "center",
                  }}
                >
                  Pas encore inscrit ?{" "}
                  <button
                    type="button"
                    onClick={() => setFlipped(true)}
                    style={ghostLink}
                    disabled={loginLoading}
                  >
                    Créer un compte
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* -------- BACK : SIGNUP -------- */}
          <div style={backFace}>
            <div style={textSide}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 8,
                    backgroundColor: COLORS.text,
                  }}
                />
                <h1 style={{ fontWeight: 700, fontSize: 22 }}>SafeBorder AI</h1>
              </div>

              <h2 style={{ fontSize: 42, fontWeight: 800, marginTop: 12 }}>
                Créez un compte
              </h2>
            </div>

            <div style={formSide}>
              <form
                onSubmit={handleSignup}
                style={{
                  width: "100%",
                  maxWidth: 360,
                  backgroundColor: "#FFFFFF",
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 12,
                  padding: 24,
                }}
              >
                <h3
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: COLORS.darkText,
                    marginBottom: 16,
                  }}
                >
                  Créer un compte
                </h3>

                {signupError && (
                  <div style={{
                    backgroundColor: "#FEE2E2",
                    color: "#DC2626",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    marginBottom: "16px",
                    fontSize: "14px",
                  }}>
                    {signupError}
                  </div>
                )}

                <input
                  type="text"
                  placeholder="Nom complet"
                  value={suName}
                  onChange={(e) => setSuName(e.target.value)}
                  required
                  className={inputCls}
                  style={inputStyle}
                  disabled={signupLoading}
                />
                <div style={{ height: 10 }} />

                <input
                  type="text"
                  placeholder="Nom d'utilisateur"
                  value={suUsername}
                  onChange={(e) => setSuUsername(e.target.value)}
                  required
                  className={inputCls}
                  style={inputStyle}
                  disabled={signupLoading}
                />
                <div style={{ height: 10 }} />

                <input
                  type="email"
                  placeholder="Email"
                  value={suEmail}
                  onChange={(e) => setSuEmail(e.target.value)}
                  required
                  className={inputCls}
                  style={inputStyle}
                  disabled={signupLoading}
                />
                <div style={{ height: 10 }} />

                <input
                  type="password"
                  placeholder="Mot de passe"
                  value={suPwd1}
                  onChange={(e) => setSuPwd1(e.target.value)}
                  required
                  className={inputCls}
                  style={inputStyle}
                  disabled={signupLoading}
                />
                <div style={{ height: 10 }} />

                <input
                  type="password"
                  placeholder="Confirmez le mot de passe"
                  value={suPwd2}
                  onChange={(e) => setSuPwd2(e.target.value)}
                  required
                  className={inputCls}
                  style={inputStyle}
                  disabled={signupLoading}
                />
                <div style={{ height: 10 }} />

                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                  className={inputCls}
                  style={inputStyle}
                  disabled={signupLoading}
                >
                  <option value="">Rôle</option>
                  <option value="admin">Admin</option>
                  <option value="simulation">Simulation (Opérateur)</option>
                  <option value="fisherman">Pêcheur</option>
                </select>

                <div style={{ height: 16 }} />

                <button
                  type="submit"
                  className={neutralBtn}
                  style={{
                    ...neutralBtnStyle,
                    opacity: signupLoading ? 0.7 : 1,
                    cursor: signupLoading ? "not-allowed" : "pointer",
                  }}
                  disabled={signupLoading}
                >
                  {signupLoading ? "Création..." : "Créer un compte"}
                </button>

                <div
                  style={{
                    marginTop: 12,
                    fontSize: 14,
                    color: COLORS.text,
                    textAlign: "center",
                  }}
                >
                  Déjà inscrit ?{" "}
                  <button
                    type="button"
                    onClick={() => setFlipped(false)}
                    style={ghostLink}
                    disabled={signupLoading}
                  >
                    Se connecter
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}