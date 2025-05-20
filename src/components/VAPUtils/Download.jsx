import React from 'react';
import { Popover } from 'antd';
import { FileImageTwoTone } from '@ant-design/icons';

export const DownloadSVG = ({ id }) => {
  return (
    <>
      <Popover content={'Donwload Image'} style={{ width: 'auto', zIndex: 999 }}>
        <FileImageTwoTone
          className="downloadButton"
          onClick={(e) => {}}
          style={{ fontSize: '150%' }}
        ></FileImageTwoTone>
      </Popover>
    </>
  );
};

export default DownloadSVG;

/* async function download(id) {
  const { Canvg } = await import('canvg');
  const svg = document.getElementById(id);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const scaleFactor = 4;

  const bbox = svg.getBoundingClientRect();
  canvas.width = bbox.width * scaleFactor;
  canvas.height = bbox.height * scaleFactor;
  context.scale(scaleFactor, scaleFactor);

  const serializedSVG = new XMLSerializer().serializeToString(svg);
  const canvg = Canvg.fromString(context, serializedSVG);
  await canvg.render();

  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-');
  const fileName = `${id}_${timestamp}.png`;

  const a = document.createElement('a');
  a.download = fileName;
  a.href = canvas.toDataURL('image/png');
  a.click();
} */
