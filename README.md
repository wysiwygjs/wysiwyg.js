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
$(function() {
  toolbar: 'top',
  buttons: [buttons],
  selectionbuttons: [selectionbuttons],
  suggester: suggester( open_suggestion ),
  interceptenter: interceptenter()
});
</script>
````
