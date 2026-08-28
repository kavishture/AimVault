AIMVAULT
=======
A standalone Valorant crosshair collection website built with HTML, CSS and vanilla JavaScript.

HOW TO OPEN
-----------
1. Keep the AimVault folder together.
2. Double-click index.html.
3. It will open directly in your browser. No npm, server, database or build step is required.

HOW TO ADD A CROSSHAIR
----------------------
Step 1:
Put your image inside:
images/crosshairs/

Step 2:
Open:
js/crosshairs.js

Step 3:
Copy this object:

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
Save the file.

Step 6:
Refresh AimVault.

WHAT EACH VALUE MEANS
---------------------
Name:
The title displayed on the card and detail view.

Image:
The exact image shown on database cards. Put the image in images/crosshairs/ and use its relative path.

Code:
The Valorant crosshair code used by the Generator preview.

Tags:
A simple list such as ["small", "cyan", "pro"]. Filter buttons are generated automatically from these tags.

ID:
A unique identifier such as "tenz-2026". Do not reuse an existing ID.

LOCAL COPY COUNTS
-----------------
Copy Code uses browser localStorage. Counts are local to the current browser/device and are NOT global website statistics.

GENERATOR
---------
The Generator parses the pasted code, creates one logical-pixel raster, and uses that exact raster for both 1:1 and magnified views. Magnification uses nearest-neighbor rendering so the geometry is not recalculated or distorted.

IMAGE RULE
----------
Database card images and Generator-rendered crosshairs are separate systems. Your uploaded card image is never replaced by a generated preview.

CUSTOMIZATION
-------------
Edit css/style.css for visual styling.
Edit js/app.js for application behavior.
Edit js/renderer.js for crosshair parsing/rendering.
Edit js/crosshairs.js for your crosshair collection.
