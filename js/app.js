var WebActivitiesTest = function WebActivitiesTest() {

  var cameraButton,
      saveButton,
      closeButton,
      toolbar,
      activity;

  var init = function init() {
    initUI();
  };

  var initUI = function initUI() {
    cameraButton = document.getElementById('cameraButton');
    cameraButton.addEventListener('click', handleEvent);
    saveButton = document.getElementById('saveButton');
    saveButton.addEventListener('click', handleEvent);
  };

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

  var pickImage = function pickImage() {
    var pick = new MozActivity({
      name: 'pick',
      data: {
        type: 'image/*'
      }
    });
    pick.onsuccess = function onsuccess() {
      applyFilter(this.result.blob);
    };
    pick.onerror = function onerror() {
      if (this.error.name == 'USER_ABORT') {
        // Cancelled by the user
      }
      // Any other error
    };
  };

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

  var startActivity = function startActivity(a) {
    if (a.source.data.blobs.length == 0) {
      a.postCancel();
      return;
    }

    activity = a;
    initUIActivity();

    applyFilter(activity.source.data.blobs[0]);
  };

  return {
    'init': init,
    'startActivity': startActivity
  };


}();

WebActivitiesTest.init();

if (navigator.mozSetMessageHandler) {
  navigator.mozSetMessageHandler('activity', function onActivity(activity) {
    WebActivitiesTest.startActivity(activity);
  });
}