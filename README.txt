AIMVAULT

IMPORTANT FILE LOCATION
All files in this version are at the repository ROOT. Do not put app.js or crosshairs.js inside a js folder unless you also change the script paths in index.html.

HOW TO ADD A CROSSHAIR
1. Open crosshairs.js.
2. Add an object inside CROSSHAIRS.
3. For an external image, put the direct image URL in image:
   image: "https://example.com/crosshair.png"
4. For a GitHub/local image use:
   image: "images/crosshairs/my-crosshair.png"
5. Change name, code and tags as needed.
6. Save and refresh the GitHub Pages site.

Example:
{
  id: "my-crosshair",
  name: "My Crosshair",
  image: "https://example.com/my-crosshair.png",
  code: "MY_VALORANT_CODE",
  tags: ["small", "cyan"]
}

The ID and tags are kept in the data for organization, but are not displayed on the website.
