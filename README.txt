AIMVAULT
========

This is a static Valorant crosshair collection website.
No npm, backend, database, login, or build process is required.

HOW TO ADD A CROSSHAIR
----------------------

1. Put your crosshair image inside:

images/crosshairs/

2. Open:

js/crosshairs.js

3. Add an object like this:

{
  id: "my-crosshair",
  name: "My Crosshair",
  image: "images/crosshairs/my-crosshair.png",
  code: "MY_VALORANT_CODE",
  tags: ["small", "cyan"]
}

4. Change the values.

- id = unique ID
- name = name shown on the website
- image = image path
- code = Valorant crosshair code
- tags = searchable/filterable tags

5. Save the file.

6. Refresh index.html or your GitHub Pages website.

IMPORTANT
---------

The website currently starts with ZERO crosshairs on purpose.
Add your own entries to js/crosshairs.js.

The images in images/crosshairs/ are also intentionally empty.

HOW TO OPEN
-----------

Double-click index.html.

For GitHub Pages, keep this structure:

index.html
css/style.css
js/app.js
js/crosshairs.js
images/logo.svg
images/crosshairs/

No generator or renderer is included because AimVault is now focused on the crosshair collection/database.
