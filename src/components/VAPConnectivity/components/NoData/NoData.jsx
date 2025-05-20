import { FrownOutlined } from '@ant-design/icons';
import { Typography } from 'antd';
const { Title } = Typography;

const innerSquareStyleNoData = {
  height: '50%',
  width: '50%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
  textAlign: 'center',
  borderRadius: '10px',
  backgroundColor: 'rgba(255, 255, 255, 0.8)'
};

export const NoData = () => {
  return (
    <div style={innerSquareStyleNoData}>
      <FrownOutlined style={{ color: '#1677ff', fontSize: '500%' }} />
      <Title style={{ color: '#1677ff' }}> App Unavailable</Title>
      <Title style={{ marginTop: '0vh', color: 'lightgrey', fontSize: '150%' }}>
        {' '}
        There is not data to display...
      </Title>
    </div>
  );
};

export default NoData;
