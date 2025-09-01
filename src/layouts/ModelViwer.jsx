import { useEffect, useRef, useState, useCallback } from 'react'; // 导入 useCallback
import * as THREE from 'three';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const ModelViewer = ({ modelData }) => {
  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);

  // 加载模型函数
  const loadModel = useCallback((data) => { // 使用 useCallback 包装
    setIsLoading(true);
    try {
      const loader = new STLLoader();
      const geometry = loader.parse(data);

      // 清除现有模型（保留光源）
      if (sceneRef.current) {
        const objectsToRemove = sceneRef.current.children.filter(
          (child) => child instanceof THREE.Mesh
        );
        objectsToRemove.forEach((child) => sceneRef.current.remove(child));
      }

      // 创建材质和网格
      const material = new THREE.MeshPhongMaterial({
        color: 0x0070f3,
        shininess: 100,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geometry, material);

      // 模型居中处理
      geometry.computeBoundingBox();
      const center = new THREE.Vector3();
      geometry.boundingBox.getCenter(center);
      mesh.position.sub(center);

      // 模型缩放处理
      const size = new THREE.Vector3();
      geometry.boundingBox.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 10 / maxDim;
      mesh.scale.set(scale, scale, scale);

      // 添加到场景
      if (sceneRef.current) {
        sceneRef.current.add(mesh);
      }

      // 调整相机位置
      if (cameraRef.current) {
        cameraRef.current.position.z = 20;
      }

      setIsLoading(false);
    } catch (error) {
      console.error('模型解析错误:', error);
      setIsLoading(false);
    }
  }, []); // 添加依赖数组，确保 loadModel 只在组件挂载时创建一次

  // 初始化Three.js场景、相机、渲染器和控制器
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    // 创建场景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    // 创建相机
    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 20; // 初始相机位置
    cameraRef.current = camera;

    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 添加光源
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // 添加控制器
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;

    // 动画循环
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 窗口大小调整处理
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const currentContainer = containerRef.current;
      const currentCamera = cameraRef.current;
      const currentRenderer = rendererRef.current;
      
      currentCamera.aspect = currentContainer.clientWidth / currentContainer.clientHeight;
      currentCamera.updateProjectionMatrix();
      currentRenderer.setSize(currentContainer.clientWidth, currentContainer.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
    };
  }, []); // 空依赖数组，只运行一次

  // 当 modelData 变化时加载模型
  useEffect(() => {
    if (modelData && sceneRef.current && cameraRef.current && rendererRef.current) {
      loadModel(modelData);
    }
  }, [modelData, loadModel]); // 依赖 modelData 和 loadModel

  return (
    <div className="relative w-full h-96">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-10">
          <p>加载模型中...</p>
        </div>
      )}
      <div 
        ref={containerRef}
        id="model-container" 
        className="w-full h-full border border-gray-200 rounded-lg overflow-hidden"
      />
    </div>
  );
};

export default ModelViewer;
