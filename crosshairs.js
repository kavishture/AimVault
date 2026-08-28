/* ==========================================================================
   AimVault — crosshairs.js
   -----------------------------------------------------------------------
   This is the ONLY file you need to edit to add, remove, or change
   crosshairs. Every page on the site (Home, Crosshairs, a crosshair's
   detail page) reads from the CROSSHAIRS array below automatically.

   To add a new crosshair:
     1. Put its image inside:  images/crosshairs/
     2. Copy one of the objects below and change the values.
     3. Save this file and refresh the site.

   See README.txt for a full step-by-step walkthrough.
   ========================================================================== */

const CROSSHAIRS = [
  {
    id: "example-1",
    name: "Example Cyan",
    image: "images/crosshairs/example-1.svg",
    code: "0;P;c;4;h;1;o;1;t;1;d;1;z;3;a;1;0b;1;0t;2;0l;3;0v;3;0o;2;0g;2;0a;1;1b;0",
    tags: ["cyan", "small"]
  },
  {
    id: "classic-white",
    name: "Classic White",
    image: "images/crosshairs/classic-white.svg",
    code: "0;P;c;0;h;1;o;1;t;1;d;0;0b;1;0t;2;0l;6;0v;6;0o;3;0g;3;0a;1;1b;0",
    tags: ["white", "pro"]
  },
  {
    id: "pro-gold",
    name: "Pro Gold Dot",
    image: "images/crosshairs/pro-gold.svg",
    code: "0;P;c;7;h;1;o;1;t;2;d;1;z;4;a;1;0b;0;1b;0",
    tags: ["dot", "pro", "gold"]
  },
  {
    id: "tenz-style",
    name: "TenZ Style",
    image: "images/crosshairs/tenz-style.svg",
    code: "0;P;c;1;h;1;o;1;t;1;d;0;0b;1;0t;2;0l;2;0v;2;0o;2;0g;2;0a;1;1b;0",
    tags: ["green", "small", "pro"]
  },
  {
    id: "green-dot-outline",
    name: "Green Dot Outline",
    image: "images/crosshairs/green-dot-outline.svg",
    code: "0;P;c;1;h;1;o;1;t;2;d;1;z;5;a;1;0b;0;1b;0",
    tags: ["green", "dot", "outline"]
  }
];

/* Exposed for other scripts (app.js, renderer.js test suite) */
if (typeof window !== "undefined") {
  window.CROSSHAIRS = CROSSHAIRS;
}
