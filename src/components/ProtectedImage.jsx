import React from 'react'; // 移除 useState, useEffect
// import { downloadFileAPI } from '@/api/fileAPI'; // 不再需要下载API

const ProtectedImage = ({ src, alt, ...props }) => {
  // 直接使用 src 作为图片的 URL，不再通过 Blob URL 转换
  // 假设 src 已经是后端提供的完整可访问 URL，例如 /download_file/yuanbao.png

  if (!src) {
    return <div>图片路径缺失</div>; // 或者返回一个占位符
  }

  // 如果需要处理加载失败的情况，可以在 img 标签上添加 onError
  const handleError = (e) => {
    e.target.src = '/placeholder-image.png'; // 设置一个默认占位图
    e.target.alt = '图片加载失败';
    console.error("图片加载失败:", src);
  };

  return <img src={src} alt={alt} onError={handleError} {...props} />;
};

export default ProtectedImage;
