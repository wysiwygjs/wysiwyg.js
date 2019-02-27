wget -O insert_photo.svg picture.svg https://material.io/tools/icons/static/icons/outline-insert_photo-24px.svg
wget -O attach_file.svg attach.svg https://material.io/tools/icons/static/icons/outline-attach_file-24px.svg
wget -O insert_link.svg link.svg https://material.io/tools/icons/static/icons/outline-insert_link-24px.svg
wget -O format_bold.svg https://material.io/tools/icons/static/icons/outline-format_bold-24px.svg
wget -O format_italic.svg italic.svg https://material.io/tools/icons/static/icons/outline-format_italic-24px.svg
wget -O format_underlined.svg underline.svg https://material.io/tools/icons/static/icons/outline-format_underlined-24px.svg
wget -O strikethrough.svg https://material.io/tools/icons/static/icons/outline-strikethrough_s-24px.svg
wget -O format_color_text.svg textcolor.svg https://material.io/tools/icons/static/icons/outline-format_color_text-24px.svg
wget -O format_color_fill.svg backcolor.svg https://material.io/tools/icons/static/icons/outline-format_color_fill-24px.svg
wget -O format_clear.svg https://material.io/tools/icons/static/icons/outline-format_clear-24px.svg
wget -O insert_emoticon.svg https://material.io/tools/icons/static/icons/outline-insert_emoticon-24px.svg

for a in `ls /tmp/s`
do 
    sed 's/<path fill="none" d="M0 0h24v24H0V*0*z"\/>//' /tmp/s/$a | sed 's/<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">/<svg xmlns="http:\/\/www.w3.org\/2000\/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">/' > $a
    php -r "echo 'background-image: url(data:image/svg+xml,'.rawurlencode(file_get_contents('$a')).');'.chr(10);"
done
