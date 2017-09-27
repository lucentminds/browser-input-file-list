# browser-input-file-list
Library for handling files selected in the browser on a web page form.

Example Useage:
```js
var field = document.getElementById( 'fileInputField' );
field.addEventListener( 'change', function( event ){
   // Create a file input list from the element's change event.
   var aList = InputFileList.createFromEvent( event );

   console.log( aList );

   aList.post({
      url: '/test_upload.php',
      params: {
         a: 1,
         b: 2,
         c: 3
      }
   });
});
```