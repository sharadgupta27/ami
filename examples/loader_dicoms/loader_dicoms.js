/* globals Stats*/

import ControlsTrackball from 'examplesBase/controls/controls.trackball';
import HelpersStack from 'examplesBase/helpers/helpers.stack';
import LoadersVolumeWorker from 'examplesBase/loaders/loaders2';
import LoadersVolume from 'examplesBase/loaders/loaders.volume';
// standard global variables
let controls;
let renderer;
let stats;
let scene;
let camera;
let stackHelper;
let threeD;

function render() {
  if (stackHelper) {
    stackHelper.index += 1;
    if (stackHelper.outOfBounds === true) {
      stackHelper.orientation = (stackHelper.orientation + 1) % 3;
      stackHelper.index = 0;
    }
  }

  controls.update();
  renderer.render(scene, camera);
  stats.update();
}

function init() {
  // this function is executed on each animation frame
  function animate() {
    render();

    // request new frame
    requestAnimationFrame(function() {
      animate();
    });
  }

  // renderer
  threeD = document.getElementById('r3d');
  renderer = new THREE.WebGLRenderer({
    antialias: true,
  });
  renderer.setSize(threeD.offsetWidth, threeD.offsetHeight);
  renderer.setClearColor(0x673ab7, 1);
  renderer.setPixelRatio(window.devicePixelRatio);
  threeD.appendChild(renderer.domElement);

  // stats
  stats = new Stats();
  threeD.appendChild(stats.domElement);

  // scene
  scene = new THREE.Scene();

  // camera
  camera = new THREE.PerspectiveCamera(45, threeD.offsetWidth / threeD.offsetHeight, 1, 10000000);
  camera.position.x = 250;
  camera.position.y = 250;
  camera.position.z = 250;

  // controls
  controls = new ControlsTrackball(camera, threeD);
  controls.rotateSpeed = 1.4;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 0.8;

  animate();
}

window.onload = function() {
  // init threeJS...
  init();

  // instantiate the loader
  // it loads and parses the dicom image
  // let loader = new LoadersVolume(threeD);

  let t2 = [
    '36444280',
    '36444294',
    '36444308',
    '36444322',
    '36444336',
    '36444350',
    '36444364',
    '36444378',
    '36444392',
    '36444406',
    '36748256',
    '36444434',
    '36444448',
    '36444462',
    '36444476',
    '36444490',
    '36444504',
    '36444518',
    '36444532',
    '36746856',
    '36746870',
    '36746884',
    '36746898',
    '36746912',
    '36746926',
    '36746940',
    '36746954',
    '36746968',
    '36746982',
    '36746996',
    '36747010',
    '36747024',
    '36748200',
    '36748214',
    '36748228',
    '36748270',
    '36748284',
    '36748298',
    '36748312',
    '36748326',
    '36748340',
    '36748354',
    '36748368',
    '36748382',
    '36748396',
    '36748410',
    '36748424',
    '36748438',
    '36748452',
    '36748466',
    '36748480',
    '36748494',
    '36748508',
    '36748522',
    '36748242',
  ];

  let files = [...t2, ...t2, ...t2].map(function(v) {
    return 'https://cdn.rawgit.com/FNNDSC/data/master/dicom/adi_brain/' + v;
  });

  let mgzFiles = ['https://cdn.jsdelivr.net/gh/fnndsc/data/mgh/orig.mgz'];

  console.time('someFunction');



  // do some benchmarking


  // // // load sequence for all files
  // let loaderYeah = new LoadersVolume(threeD);
  // loaderYeah
  //   .load(files)
  //   .then(function() {
  //     console.timeEnd('someFunction');

   
  //   });

  // // load sequence for all files
  // return;

  // pool of size 4 ?
  // re-use
  const w0 = new LoadersVolumeWorker();
  const w1 = new LoadersVolumeWorker();
  const w2 = new LoadersVolumeWorker();
  const w3 = new LoadersVolumeWorker();

  const fileTodo = files;

  const handleWorkerFinished = (worker) => {
    if (fileTodo.length > 0) {
      parallelProgress.push(
        worker.loadInstance({file: fileTodo.pop()}).then((value) => {
        handleWorkerFinished(worker);
        return value;
      }));
    }
  }

  const parallelProgress = [];
  parallelProgress.push(w0.loadInstance({file: fileTodo.pop()}).then((value) => {
    handleWorkerFinished(w0);
    return value;
  }));
  parallelProgress.push(w1.loadInstance({file: fileTodo.pop()}).then((value) => {
    handleWorkerFinished(w1);
    return value;
  }));
  parallelProgress.push(w2.loadInstance({file: fileTodo.pop()}).then((value) => {
    handleWorkerFinished(w2);
    return value;
  }));
  parallelProgress.push(w3.loadInstance({file: fileTodo.pop()}).then((value) => {
    handleWorkerFinished(w3);
    return value;
  }));

  // const loaders = files.map((file) => {
  //   return lld.loadInstance({file});
  // });
  Promise.all(parallelProgress)
    .then((seriesLoaded) => {
      console.timeEnd('someFunction');
      // make a proper function for this guy...
      // let series = seriesLoaded[0].mergeSeries(seriesLoaded)[0];
      // window.console.log(series);
      // let stack = series.stack[0];
      // stackHelper = new HelpersStack(stack);
      // stackHelper.bbox.color = 0xf9f9f9;
      // stackHelper.border.color = 0xf9f9f9;
      // scene.add(stackHelper);

      // window.console.log(stack.ijk2LPS);


      // // update camrea's and control's target
      // let centerLPS = stackHelper.stack.worldCenter();
      // camera.lookAt(centerLPS.x, centerLPS.y, centerLPS.z);
      // camera.updateProjectionMatrix();
      // controls.target.set(centerLPS.x, centerLPS.y, centerLPS.z);

      // function onWindowResize() {
      //   camera.aspect = window.innerWidth / window.innerHeight;
      //   camera.updateProjectionMatrix();

      //   renderer.setSize(window.innerWidth, window.innerHeight);
      // }

      // window.addEventListener('resize', onWindowResize, false);

      // // force 1st render
      // render();
      // // notify puppeteer to take screenshot
      // const puppetDiv = document.createElement('div');
      // puppetDiv.setAttribute('id', 'puppeteer');
      // document.body.appendChild(puppetDiv);
    })
    .catch(function(error) {
      window.console.log('oops... something went wrong...');
      window.console.log(error);
    });
};
