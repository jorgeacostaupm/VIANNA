import { Col, Row } from 'antd';
import { useSelector } from 'react-redux';
import React, { useEffect, useState, useRef } from 'react';
import { Button, Modal } from 'antd';
import Container from '../Container';
import Menu from '.';
import DataManager from '../../../managers/DataManager';

const utils = DataManager.getInstance();

function calculateRows(numBands) {
  if (numBands <= 3) {
    return 1;
  } else if (numBands === 4 || numBands === 5 || numBands === 6) {
    return 2;
  } else {
    // For 7 or more elements, return 3 columns
    return 3;
  }
}

function calculateColumns(numBands) {
  if (numBands === 1) {
    return 1;
  } else if (numBands === 2 || numBands === 4) {
    return 2;
  } else {
    return 3;
  }
}

export const MultiplesModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <Button type="primary" style={{ width: '100%' }} onClick={showModal}>
        Juxtapose
      </Button>
      {isModalOpen && <ViewModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />}
    </>
  );
};

const ViewModal = (props) => {
  const multi_attrs = useSelector((state) => state.circular.multi_attrs);

  const [calculatedWidth, setCalculatedWidth] = useState(
    `${100 / calculateRows(multi_attrs.length)}%`
  );
  const [calculatedHeight, setCalculatedHeight] = useState(
    `${100 / calculateColumns(multi_attrs.length)}%`
  );

  useEffect(() => {
    setCalculatedWidth(`${100 / calculateRows(multi_attrs.length)}%`);
    setCalculatedHeight(`${100 / calculateColumns(multi_attrs.length)}%`);
  }, [multi_attrs]);

  const handleOk = () => {
    props.setIsModalOpen(false);
  };

  return (
    <>
      <Modal
        open={props.isModalOpen}
        onCancel={handleOk}
        footer={null}
        width={'100vw'}
        style={{ top: '0vh' }}
      >
        <Row>
          <Col span={3}>
            <Menu modal={true} />
          </Col>
          <Col span={20}>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0px',
                height: '100vh',
                position: 'relative'
              }}
            >
              {multi_attrs.map((attr) => (
                <Container
                  calculatedHeight={calculatedHeight}
                  calculatedWidth={calculatedWidth}
                  key={utils.getAttrKey(attr)}
                  attr={attr}
                />
              ))}
            </div>
          </Col>
        </Row>
      </Modal>
    </>
  );
};
