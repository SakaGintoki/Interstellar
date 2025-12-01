// src/components/SceneHUD.jsx
import React, { useEffect, useState } from "react";
import { useSceneStore } from "../hooks/useSceneStore";

// Scene → copy text
const SCENE_COPY = {
  atom: {
    title: "Atom",
    tagline: "Building block of matter",
  },
  dna: {
    title: "DNA",
    tagline: "Genetic information carrier",
  },
  cell: {
    title: "Cell",
    tagline: "Basic unit of life",
  },
  earth: {
    title: "Earth",
    tagline: "Our living planet",
  },
  solar: {
    title: "Solar System",
    tagline: "Our cosmic neighborhood",
  },
  galaxy: {
    title: "Galaxy",
    tagline: "Island of star systems",
  },
  universe: {
    title: "Universe",
    tagline: "All space and time",
  },
};

// Shared paragraph (for now)
const SCENE_PARAGRAPH = {
  atom: `Atom adalah tata surya terkecil penyusun semesta. Intinya padat layaknya matahari, dikelilingi elektron yang mengorbit cepat. Inilah blok bangunan dasar dari semua materi yang Anda sentuh.`,
  dna: `DNA adalah kode rahasia kehidupan Anda. Molekul ini menyimpan instruksi lengkap dari orang tua, menentukan segala sifat unik tubuh dan memastikan cerita kehidupan terus berlanjut.`,
  cell: `Sel adalah pabrik mikroskopis yang tak pernah tidur. Unit terkecil ini bekerja nonstop mengubah makanan menjadi energi dan menjalankan instruksi tubuh agar Anda tetap hidup dan bergerak.`,
  earth: `Bumi dan Bulan adalah pasangan dansa abadi. Gravitasi mengikat keduanya, di mana Bulan menjaga kestabilan putaran Bumi dan mengatur irama pasang surut lautan kita.`,
  solar: `Tata surya adalah keluarga besar planet yang mengelilingi Matahari. Dari planet batuan hingga raksasa gas, semuanya berdansa mengelilingi satu titik api kehidupan karena ikatan gravitasi yang kuat.`,
  galaxy: `Galaksi adalah kota metropolitan bertabur bintang. Pusatnya yang terang benderang mengikat ratusan miliar tata surya termasuk milik kita dalam satu putaran gravitasi yang megah.`,
  universe: `Universe adalah samudra kosmik tanpa tepi. Galaksi-galaksi hanyalah pulau cahaya kecil yang tersebar di dalamnya. Ini adalah wadah mahaluas tempat semua sejarah dan masa depan terjadi.`,
}
export function SceneHUD() {
   const currentScale = useSceneStore((s) => s.currentScale) || "atom";
  const { title, tagline } = SCENE_COPY[currentScale] || SCENE_COPY.atom;

  const paragraph = SCENE_PARAGRAPH[currentScale] || "";

  const [displayTitle, setDisplayTitle] = useState("");
  const [displayTagline, setDisplayTagline] = useState("");
  const [displayParagraph, setDisplayParagraph] = useState("");

  useEffect(() => {
    setDisplayTitle("");
    setDisplayTagline("");
    setDisplayParagraph("");

    const timeouts = [];

    // --- Title: type then untype (from front) ---
    const typeSpeedTitle = 80;  // ms per character
    const eraseSpeedTitle = 60; // ms per character
    const holdTitle = 400;      // ms fully visible before erase

    // Type title left → right
    for (let i = 0; i < title.length; i++) {
      timeouts.push(
        setTimeout(() => {
          setDisplayTitle(title.slice(0, i + 1));
        }, i * typeSpeedTitle)
      );
    }

    const titleTypeDuration = title.length * typeSpeedTitle;
    const titleEraseStart = titleTypeDuration + holdTitle;

    // Erase from front: "Atom" → "tom" → "om" → "m" → ""
    for (let i = 0; i < title.length; i++) {
      timeouts.push(
        setTimeout(() => {
          setDisplayTitle(title.slice(i + 1));
        }, titleEraseStart + i * eraseSpeedTitle)
      );
    }

    // --- Tagline: same pattern, slightly delayed ---
    const taglineDelay = 200;       // start a bit after title starts
    const typeSpeedTag = 60;
    const eraseSpeedTag = 50;
    const holdTag = 300;

    for (let i = 0; i < tagline.length; i++) {
      timeouts.push(
        setTimeout(() => {
          setDisplayTagline(tagline.slice(0, i + 1));
        }, taglineDelay + i * typeSpeedTag)
      );
    }

    const tagTypeDuration = tagline.length * typeSpeedTag;
    const tagEraseStart =
      taglineDelay + tagTypeDuration + holdTag;

    for (let i = 0; i < tagline.length; i++) {
      timeouts.push(
        setTimeout(() => {
          setDisplayTagline(tagline.slice(i + 1));
        }, tagEraseStart + i * eraseSpeedTag)
      );
    }

    // --- Paragraph: fast type, no erase ---
    const paraSpeed = 8;
    for (let i = 0; i < paragraph.length; i++) {
      timeouts.push(
        setTimeout(() => {
          setDisplayParagraph(paragraph.slice(0, i + 1));
        }, i * paraSpeed)
      );
    }

    return () => timeouts.forEach(clearTimeout);
  }, [currentScale, title, tagline, paragraph]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "50%",      // only over the LEFT canvas
        height: "100%",
        pointerEvents: "none",
        zIndex: 34,
      }}
    >
      {/* Top center title + tagline */}
      <div
        style={{
          position: "absolute",
          top: 32, // leave some padding from top edge
          left: 0,
          width: "100%",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-block",
            padding: "6px 16px",
            borderRadius: 999,
            background: "rgba(0,0,0,0.65)",
            border: "1px solid rgba(180,220,255,0.5)",
            boxShadow: "0 12px 30px rgba(0,0,0,0.45)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            style={{
              fontSize: 20,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "#f7fbff",
              fontWeight: 600,
            }}
          >
            {displayTitle}
          </div>
          <div
            style={{
              marginTop: 4,
              fontSize: 12,
              letterSpacing: 1,
              textTransform: "uppercase",
              color: "#b3d6ff",
            }}
          >
            {displayTagline}
          </div>
        </div>
      </div>

      {/* Bottom-right paragraph card */}
      <div
        style={{
          position: "absolute",
          right: 24,
          bottom: 24,
          maxWidth: "60%",
        }}
      >
        <div
          style={{
            padding: "14px 18px",
            borderRadius: 18,
            background:
              "linear-gradient(135deg, rgba(0,0,0,0.85), rgba(10,20,40,0.9))",
            border: "1px solid rgba(140, 190, 255, 0.6)",
            boxShadow:
              "0 18px 40px rgba(0,0,0,0.7), 0 0 25px rgba(90,180,255,0.4)",
            color: "#dfe9ff",
            fontSize: 13,
            lineHeight: 1.5,
            textAlign: "justify",
          }}
        >
          {displayParagraph}
        </div>
      </div>
    </div>
  );
}
