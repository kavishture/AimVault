AIMVAULT
========
A standalone Valorant crosshair collection website built with HTML, CSS and vanilla JavaScript.

HOW TO OPEN
------------
1. Keep the AimVault folder together.
2. Double-click index.html.
3. It opens directly in your browser. No npm, server, database or build step is required.

HOW TO ADD A CROSSHAIR
-----------------------
Step 1:
Put your image inside:
images/crosshairs/

Step 2:
Open:
js/crosshairs.js

Step 3:
Copy this:

{
  id: "my-crosshair",
  name: "My Crosshair",
  image: "images/crosshairs/my-crosshair.png",
  code: "MY_VALORANT_CODE",
  tags: ["small", "cyan"]
}

Step 4:
Change the values.

Step 5:
Save.

Step 6:
Refresh AimVault.

WHAT TO CHANGE
--------------
id     = unique ID. Use lowercase letters, numbers and hyphens.
name   = the name shown on the card.
image  = the exact path to your uploaded crosshair image.
code   = the Valorant crosshair code users copy.
tags   = searchable/filterable labels such as pro, small, cyan or dot.

IMAGE RULES
-----------
- Put crosshair images in images/crosshairs/.
- The website keeps the image aspect ratio and does not crop it.
- If an image is missing, AimVault shows "Image unavailable" instead of a broken-image icon.

COPY COUNTS
-----------
Copy counts are stored only in the visitor's browser using localStorage.
They are NOT global website statistics.

FILES
-----
index.html              Main page structure.
css/style.css           Design and responsive layout.
js/app.js               Search, filters, cards, copying and details.
js/crosshairs.js        Your crosshair collection data.
js/renderer.js          Reserved renderer module from the original project; the current site does not load the generator UI.
images/logo.svg         AimVault logo and favicon.
images/crosshairs/      Your crosshair images.
