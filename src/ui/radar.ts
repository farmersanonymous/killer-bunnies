import { BabylonStore } from '../store/babylonStore'
import { Camera, Viewport, FreeCamera, Vector3 } from 'babylonjs'

export class Radar {
    constructor() {
        const radar = new FreeCamera("radar", new Vector3(0,10,0), BabylonStore.scene);
        radar.layerMask = 1;
        radar.setTarget(new Vector3(0.1,0.1,0.1));
        radar.mode = Camera.ORTHOGRAPHIC_CAMERA;
        
        radar.orthoLeft = -10/2;
        radar.orthoRight = 10/2;
        radar.orthoTop =  10/2;
        radar.orthoBottom = -10/2;
    
        radar.rotation.y = 0;
    
        radar.viewport = new Viewport(0.01,0,0.195,0.18);
        
        BabylonStore.scene.activeCamera = BabylonStore.camera;
        BabylonStore.scene.activeCameras.push(BabylonStore.camera);
    
        BabylonStore.scene.activeCameras.push(radar);
		radar.layerMask = 1
        BabylonStore.camera.layerMask = 2
    }
}