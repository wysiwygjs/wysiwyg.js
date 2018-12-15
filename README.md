Changes in Version 3:
==========

* Dropped jQuery dependency
* CSS3 transitions if possible
* Dropped support for IE 6-8, Safari 3.1-5
* Improved suggestions, e.g. '@username'
* Simplified button API
* New markup, see example:

**http://wysiwygjs.github.io/**

Markup
==========

````
<div class="wysiwyg">
  <textarea name="name" placeholder="Write a comment ..."></textarea>
</div>

<script>
wysiwyg( '.wysiwyg', {
  toolbar: 'top',                           // 'top','bottom',null
  buttons: [buttons],                       // buttons on toolbar
  selectionbuttons: [selectionbuttons],     // buttons on selection-toolbar
  suggester: suggester( open_suggestion ),  // handle suggestions
  interceptenter: interceptenter(),         // intercept 'enter'
  hijackmenu: false                         // toolbar instead context menu
});
</script>
````
