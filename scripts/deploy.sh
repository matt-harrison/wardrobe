rm -rf ../rbc/projects/wardrobe/
cp -r build/ wardrobe/
mv wardrobe ../rbc/projects/wardrobe
scp -r ../rbc/projects/wardrobe kittenb1@rootbeercomics.com:/home1/kittenb1/www/projects/
