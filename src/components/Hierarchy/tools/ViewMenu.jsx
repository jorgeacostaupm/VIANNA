import { pubsub } from '@/components/VAPUtils/pubsub';
import OptionMenu from './OptionMenu';
import SearchNodeBar from './SearchNodeBar';
import { Button } from 'antd';
import { ExpandOutlined } from '@ant-design/icons';

const ViewMenu = ({ openImportModal, openAutoModal }) => {
  const { publish } = pubsub;
  return (
    <>
    <div
        style={{
          position: 'absolute',
          top: '1.25rem', // equivalente a left-5
          left: '1.25rem', // equivalente a bottom-5
          background:'green',
        }}
      >
      <OptionMenu openImportModal={openImportModal} openAutoModal={openAutoModal}></OptionMenu>
      <Button
        type="primary"
        style={{ position: 'absolute', left: '4.2rem', top: '1.25rem' }}
        onClick={() => publish('zoomInteractionEvent', { resetPosition: true })}
      >
        <ExpandOutlined />
      </Button>
      <SearchNodeBar />
      </div>
    </>
  );
};

export default ViewMenu;
