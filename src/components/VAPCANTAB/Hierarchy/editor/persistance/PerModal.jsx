import { useDispatch, useSelector } from 'react-redux';
import {
  nodeSelector,
  setFullMeta
} from '@/components/VAPUtils/features/metadata/metaSlice';
import { useState } from 'react';
import { Modal, Button, Tabs } from 'antd';
import { useDropzone } from 'react-dropzone';
import * as Yup from 'yup';
import DragAndDropCSV from '@/components/VAPCANTAB/Utils//DragDropCSV';
import { PlusOutlined } from '@ant-design/icons';
import DragAndDropHierarchy from '@/components/VAPCANTAB/Utils//DragDropHierarchy';

function generateFileName(baseName = 'CANTAB_data') {
  const fechaActual = new Date();
  const anio = fechaActual.getFullYear();
  const mes = String(fechaActual.getMonth() + 1).padStart(2, '0'); // Mes (de 0 a 11, por eso sumamos 1)
  const dia = String(fechaActual.getDate()).padStart(2, '0'); // Día
  const horas = String(fechaActual.getHours()).padStart(2, '0'); // Horas
  const minutos = String(fechaActual.getMinutes()).padStart(2, '0'); // Minutos
  const segundos = String(fechaActual.getSeconds()).padStart(2, '0'); // Segundos

  // Nombre del archivo con la fecha actual
  const nombreDeFichero = `${baseName}_${anio}-${mes}-${dia}_${horas}-${minutos}-${segundos}`;

  return nombreDeFichero;
}

const ExportTab = ({ metadata }) => {
  const allData = useSelector((state) => state.dataframe.dataframe);
  const selectionData = useSelector((state) => state.cantab.selection);
  const navioColumns = useSelector((state) => state.dataframe.navioColumns);

  const saveMetadata = () => {
    const meta = JSON.stringify(metadata, null, 2);
    const blob = new Blob([meta], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = href;
    downloadLink.download = 'hierarchy.json';
    downloadLink.click();
  };

  const convertToCSV = (array) => {
    const keys = navioColumns;
    const csvRows = [keys.join(',')];

    array.forEach((obj) => {
      const values = keys.map((key) => obj[key]);
      csvRows.push(values.join(','));
    });

    return csvRows.join('\n');
  };

  const saveData2CSV = (data, name) => {
    const csvData = convertToCSV(data);
    const blob = new Blob([csvData], { type: 'text/csv' });
    const href = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = href;
    downloadLink.download = generateFileName(name);
    downloadLink.click();
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        padding: '20px'
      }}
    >
      <Button type={'primary'} onClick={saveMetadata}>
        Export Hierarchy
      </Button>

      <Button type={'primary'} onClick={() => saveData2CSV(allData, 'CANTAB_all')}>
        Export All
      </Button>

      <Button type={'primary'} onClick={() => saveData2CSV(selectionData, 'CANTAB_selection')}>
        Export Selection
      </Button>
    </div>
  );
};

const fileValidation = (metadata, content) => {
  const attributes = metadata.filter((n) => n.type === 'attribute').map((n) => n.name);
  const contentAttributes = content.filter((n) => n.type === 'attribute').map((n) => n.name);
  return (
    contentAttributes.length <= attributes.length &&
    contentAttributes.every((n) => attributes.includes(n))
  );
};

const UploadComponent = () => {
  const { acceptedFiles, getInputProps, getRootProps, isDragActive } = useDropzone({
    accept: { 'application/json': ['.json'] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onload = () => {};
      reader.readAsText(file);
    }
  });

  const boxStyle = {
    height: '200px',
    width: '100%',
    borderStyle: 'dashed',
    borderWidth: '2px',
    borderColor: '#1677ff',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    backgroundColor: isDragActive ? '#e6f7ff' : '#fafafa'
  };

  const iconStyle = {
    fontSize: '2rem',
    color: '#1677ff',
    fontWeight: 'bold'
  };

  const textStyle = {
    color: '#1677ff',
    fontSize: '1.125rem',
    textAlign: 'center',
    padding: '0 1rem'
  };

  const subtitleStyle = {
    color: '#9CA3AF',
    fontSize: '0.875rem',
    textAlign: 'center',
    padding: '0 1rem'
  };

  return (
    <div {...getRootProps({ style: boxStyle })}>
      <input {...getInputProps()} />
      {acceptedFiles.length < 1 ? (
        !isDragActive && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <PlusOutlined style={{ color: '#1677ff' }} />
            <span style={textStyle}>Click or Drop the file.</span>
            <span style={subtitleStyle}>Only JSON files are accepted.</span>
          </div>
        )
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ color: '#1677ff', fontSize: '1.125rem', wordBreak: 'break-word' }}>
            {acceptedFiles[0].name}
          </span>
        </div>
      )}
    </div>
  );
};

const importValidation = Yup.object({
  file: Yup.mixed().required('Add a file.'),
  'load-meta': Yup.boolean(),
  'load-hier': Yup.boolean()
}).test({
  name: 'test-mode',
  test: function (value) {
    const { 'load-meta': loadMeta, 'load-hier': loadHier } = value;
    if (!loadMeta && !loadHier) {
      return this.createError({
        path: 'load-meta',
        message: 'Select charge method.'
      });
    }
    return true;
  }
});

const ImportTab = ({ setOpen, metadata }) => {
  const dispatch = useDispatch();

  const onSubmit = (values) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsedJson = JSON.parse(reader.result);
        dispatch(setFullMeta(parsedJson));
        setOpen(false);
      } catch (error) {}
    };
    reader.readAsText(values.file);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        height: '100%',
        width: '100%'
      }}
    >
      <div style={{ width: '100%' }}>
        <h2 style={{ fontWeight: 'bold', fontSize: '1.125rem', color: '#1677ff' }}>Data:</h2>
      </div>
      <div style={{ width: '50%', margin: '1rem 0' }}>
        <DragAndDropCSV />
      </div>

      <div style={{ width: '100%' }}>
        <h2 style={{ fontWeight: 'bold', fontSize: '1.125rem', color: '#1677ff' }}>Hierarchy:</h2>
      </div>
      <div style={{ width: '50%', margin: '1rem 0' }}>
        <DragAndDropHierarchy />
      </div>
    </div>
  );
};

const PerModal = ({ setOpen, isModalOpen, setIsModalOpen }) => {
  const metadata = useSelector(nodeSelector);
  const [tab, setTab] = useState('import');

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const items = [
    {
      key: '1',
      label: 'Import',
      children: <ImportTab metadata={metadata} setOpen={setOpen} />
    },
    {
      key: '2',
      label: 'Export',
      children: <ExportTab metadata={metadata} />
    }
  ];

  return (
    <>
      <Modal
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        width={'50%'}
        footer={null}
        style={{ top: 50 }}
      >
        <Tabs defaultActiveKey="1" items={items} />
      </Modal>
    </>
  );
};

export default PerModal;
