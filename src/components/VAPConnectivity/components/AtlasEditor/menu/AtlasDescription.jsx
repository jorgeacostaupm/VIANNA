import { useDispatch, useSelector } from 'react-redux';
import React from 'react';
import { Descriptions, Flex, Input, Select, Row, Col } from 'antd';
import { description } from '../configuration/config.json';
import {
  setAtlasEditDescription,
  setAtlasEditTitle,
  setAtlasEditViewPolicy
} from '@/components/VAPUtils/features/atlas/atlasSlice';

const { TextArea } = Input;

const AtlasEditName = () => {
  const title = useSelector((state) => state.atlas.edit_title);
  const dispatch = useDispatch();

  const handleChange = (e) => {
    const newValue = e.target.value;
    console.log(newValue);
    dispatch(setAtlasEditTitle(newValue));
  };

  return <Input style={{ width: '100%' }} onChange={handleChange} value={title} />;
};

const AtlasEditDescription = () => {
  const desc = useSelector((state) => state.atlas.edit_description);
  const dispatch = useDispatch();

  const handleChange = (e) => {
    const newValue = e.target.value;
    dispatch(setAtlasEditDescription(newValue));
  };

  return (
    <TextArea
      rows={4}
      style={{
        width: '100%'
      }}
      onChange={handleChange}
      value={desc}
    />
  );
};

const AtlasEditViewPolicy = () => {
  const policy = useSelector((state) => state.atlas.edit_view_policy);
  const dispatch = useDispatch();

  const handleChange = (value) => {
    dispatch(setAtlasEditViewPolicy(value));
  };

  return (
    <Select value={policy} onChange={handleChange} style={{ width: '100%' }}>
      <Select.Option value="public">Public</Select.Option>
      <Select.Option value="private">Private</Select.Option>
    </Select>
  );
};

export const AtlasDescription = () => {
  const atlas = useSelector((state) => state.atlas.selected_atlas);

  return (
    <>
      {atlas && (
        <Flex vertical style={{ gap: '10px' }}>
          <Row align="middle">
            <Col>
              <div style={{ minWidth: '80px', marginRight: '10px', textAlign: 'left' }}>
                Title:{' '}
              </div>
            </Col>
            <Col>
              <AtlasEditName />
            </Col>
          </Row>

          <Row align="middle">
            <Col>
              <div style={{ minWidth: '80px', marginRight: '10px', textAlign: 'left' }}>
                View Policy:{' '}
              </div>
            </Col>
            <Col>
              <AtlasEditViewPolicy />
            </Col>
          </Row>

          <Row style={{ display: 'flex', gap: '20px' }}>
            <div style={{ minWidth: '80px', marginRight: '10px', textAlign: 'left' }}>
              Description:
            </div>
            <AtlasEditDescription />
          </Row>

          <Row align="middle">
            <Col>
              <div style={{ minWidth: '80px', marginRight: '10px', textAlign: 'left' }}>
                Creator:
              </div>
            </Col>
            <Col>
              <div style={{ color: 'gray' }}>{atlas.owned_by}</div>
            </Col>
          </Row>
        </Flex>
      )}
    </>
  );
};
