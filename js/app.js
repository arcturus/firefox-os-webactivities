var WebActivitiesTest = function WebActivitiesTest() {

  var cameraButton,
      saveButton,
      closeButton,
      toolbar,
      activity;

  var init = function init() {
    initUI();
  };

  // Attach listeners to our ui
  var initUI = function initUI() {
    cameraButton = document.getElementById('cameraButton');
    cameraButton.addEventListener('click', handleEvent);
    saveButton = document.getElementById('saveButton');
    saveButton.addEventListener('click', handleEvent);
  };

  // Modify our UI if we are acting as a web activity
  var initUIActivity = function initUIActivity() {
    toolbar = document.getElementById('toolbar');
    toolbar.classList.add('hide');

    closeButton = document.getElementById('closeButton');
    closeButton.classList.remove('hide');
    closeButton.addEventListener('click', handleEvent);
  };

  var handleEvent = function onEvent(evt) {
    switch (evt.target.id) {
      case 'cameraButton':
        pickImage();
        break;
      case 'saveButton':
        saveToSdcard();
        break;
      case 'closeButton':
        if (activity != null) {
          //activity.postError({});
          //activity.postResult({});
          activity = null;
          window.close();
        }
        break;
    }
  };

  /**
    Here we are using a web activity, note that we create a new
    MozActivty object, and we pass an object with the name of the
    action that we want to do, and some filters. 

    In this case we don't pass any parameters, cause want to get
    content (images) from other apps
  */
  var pickImage = function pickImage() {
    var pick = new MozActivity({
      name: 'pick',
      data: {
        type: 'image/*'
      }
    });

    /*
      This callback will be executed once that we
      select the image from the app that is providing
      the web activity.

      Get the image as a blog (this depends on the kind
      of action)
    */
    pick.onsuccess = function onsuccess() {
      applyFilter(this.result.blob);
    };
    /*
      Error callback can be launched if the activity
      is canceled, or if there is any problem.
    */
    pick.onerror = function onerror() {
      if (this.error.name == 'USER_ABORT') {
        // Cancelled by the user
      }
      // Any other error
    };
  };

  // Our app logic just applies a brightness filter to the
  // image that we are working on
  var applyFilter = function applyFilter(blob) {
    var img = new Image();
    img.src = window.URL.createObjectURL(blob);
    img.onload = function onLoad() {
      var canvas = document.querySelector('canvas');
      canvas.width = 320;
      canvas.height = 390;
      var bitmap = new BitmapData(320, 390);
      var brightness = [
        2, 0, 0, 0, 0,
        0, 2, 0, 0, 0,
        0, 0, 2, 0, 0,
        0, 0, 0, 1, 0
      ];
      var brightnessFilter = new ColorMatrixFilter(brightness);
      var zeroPoint = new Point();
      bitmap.draw(img);
      bitmap.applyFilter(bitmap, bitmap.rect, zeroPoint, brightnessFilter);
      var context = canvas.getContext('2d');
      context.putImageData(bitmap.data, 0, 0);
    };
  };

  var saveToSdcard = function saveToSdcard() {

  };

  /*
    This method is invoked when we are acting as a web activity

    We look for parameters, since we will be implementing a 'share'
    activity, we look for the parameter, if any problem we can
    cancel the activity in our side, if the caller application is
    not sending the correct parameters to us to work.
  */
  var startActivity = function startActivity(a) {
    if (a.source.data.blobs.length == 0) {
      a.postCancel();
      return;
    }

    activity = a;
    // Modify the UI to reflect we are an activity
    initUIActivity();

    // Execute our action
    applyFilter(activity.source.data.blobs[0]);
  };

  return {
    'init': init,
    'startActivity': startActivity
  };


}();

WebActivitiesTest.init();

/*
  More magic happening here.

  This is a System Message:
  https://developer.mozilla.org/en-US/docs/Web/API/window.navigator.mozSetMessageHandler?redirectlocale=en-US&redirectslug=DOM%2Fwindow.navigator.mozSetMessageHandler
  http://mxr.mozilla.org/mozilla-central/source/dom/messages/interfaces/nsIDOMNavigatorSystemMessages.idl

  Which allow to register functions to messages coming from the system (Gecko),
  no matter if our application it's not running. The system will ensure this application
  will be opened and the message deliveired.

  In this case the system message 'activty' will be send to us when
  some app wants to use as a web activity.

  Check the manifest for the web activity declaration.
*/
if (navigator.mozSetMessageHandler) {
  navigator.mozSetMessageHandler('activity', function onActivity(activity) {
    WebActivitiesTest.startActivity(activity);
  });
}