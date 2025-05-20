import { useState, useEffect, useRef } from 'react';
import { Button } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import * as aq from 'arquero';
import {
  addAttribute,
  removeAttribute
} from '@/components/VAPUtils/features/metadata/metaCreatorReducer';
import { pubsub } from '@/components/VAPUtils/pubsub';

const { subscribe, unsubscribe, publish } = pubsub;

const OptionMenu = ({ start, openImportModal, openAutoModal }) => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const menuRef = useRef();
  const dataframe = useSelector((state) => state.dataframe.dataframe);
  const hierarchy = useSelector((state) => state.metadata.attributes);

  const styles = {
    menu: {
      position: 'absolute',
      marginTop: '10px',
      padding: 5,
      gap: 5,
      display: 'flex',
      flexDirection: 'column',
      height: 'auto',
      backgroundColor: '#FAFAFA',
      borderRadius: '5px',
      boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)'
    },
    wrapper: {
      position: 'absolute',
      left: '0.75rem',
      top: '1.25rem'
    },
    buttonFullWidth: {
      width: '100%'
    }
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (isMenuOpen && menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('pointerdown', handleOutsideClick);

    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick);
    };
  }, [isMenuOpen]);

  const getDataframeVariables = () => {
    const hierarchyAggVars = hierarchy.filter((d) => d.type === 'aggregation').map((d) => d.name);

    return aq
      .from(dataframe)
      .columnNames()
      .filter((colName) => !hierarchyAggVars.includes(colName) && colName !== 'myIdVariable');
  };

  const handleHierDataDiff = () => {
    const hierarchyVars = hierarchy.filter((d) => d.type === 'attribute').map((d) => d.name);
    const datasetVars = getDataframeVariables();

    const missing = datasetVars.filter((varName) => !hierarchyVars.includes(varName));
    const extra = hierarchyVars.filter((varName) => !datasetVars.includes(varName));

    console.log({ missing, extra });

    const isCoordinated = missing.length === 0 && extra.length === 0;

    publish('notification', {
      message: isCoordinated
        ? 'Data and Hierarchy are Coordinated'
        : 'Data and Hierarchy are Uncoordinated',
      description: isCoordinated
        ? ''
        : `Nº Missing variables: ${missing.length}, Nº Extra variables: ${extra.length}`,
      placement: 'topRight',
      type: isCoordinated ? 'success' : 'info',
      duration: 4,
      pauseOnHover: true
    });
  };

  const addMissingNodes = () => {
    const hierarchyVars = hierarchy.filter((d) => d.type === 'attribute').map((d) => d.name);
    const datasetVars = getDataframeVariables();

    const missingVars = datasetVars.filter((varName) => !hierarchyVars.includes(varName));

    missingVars.forEach((varName) => {
      dispatch(
        addAttribute({
          parentID: 0,
          id: getRandomInt(),
          name: varName,
          type: 'attribute'
        })
      );
    });

    const isMissingVars = missingVars.length > 0;

    publish('notification', {
      message: isMissingVars ? 'Missing variables added' : 'There are no missing variables',
      description: isMissingVars ? `Nº Missing variables added: ${missingVars.length}` : '',
      placement: 'topRight',
      type: isMissingVars ? 'success' : 'error',
      duration: 4,
      pauseOnHover: true
    });
  };

  const removeExtraNodes = () => {
    const datasetVars = getDataframeVariables();

    const extraNodeIds = hierarchy
      .filter(
        (node) =>
          !datasetVars.includes(node.name) && node.type !== 'aggregation' && node.name !== 'root'
      )
      .map((node) => node.id);

    extraNodeIds.forEach((id) => {
      dispatch(removeAttribute({ attributeID: id }));
    });

    const isExtraVars = extraNodeIds.length > 0;
    publish('notification', {
      message: isExtraVars ? 'Extra variables removed' : 'There are no extra variables',
      description: isExtraVars ? `Nº Extra variables removed: ${extraNodeIds.length}` : '',
      placement: 'topRight',
      type: isExtraVars ? 'success' : 'error',
      duration: 4,
      pauseOnHover: true
    });
  };

  const openModal = (modalType) => {
    modalType === 'persistance' ? openImportModal(true) : openAutoModal(true);
    setMenuOpen(false);
  };

  return (
    <div ref={menuRef} style={styles.wrapper}>
      <Button
        type="primary"
        className="border border-solid"
        onClick={() => setMenuOpen((prev) => !prev)}
      >
        <MenuOutlined />
      </Button>
      {isMenuOpen && (
        <div style={styles.menu}>
          <Button
            type="primary"
            style={styles.buttonFullWidth}
            onClick={() => openModal('persistance')}
          >
            Import / Export
          </Button>
          <Button type="primary" style={styles.buttonFullWidth} onClick={handleHierDataDiff}>
            Hierarchy/Data Difference
          </Button>
          <Button type="primary" style={styles.buttonFullWidth} onClick={addMissingNodes}>
            Add Missing Nodes
          </Button>
          <Button type="primary" style={styles.buttonFullWidth} onClick={removeExtraNodes}>
            Remove Extra Nodes
          </Button>
          {
            <Button
              type="primary"
              style={styles.buttonFullWidth}
              onClick={() => openModal('creation')}
            >
              Automatic Hierarchy
            </Button>
          }
        </div>
      )}
    </div>
  );
};

function getRandomInt(min = 0, max = 999999) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default OptionMenu;
