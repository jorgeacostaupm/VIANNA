import { useEffect, useState } from 'react';
import CustomDetails from './CustomDetails';
import StatusMarker from './StatusMarker';
import { CreateToMeta } from '@/components/VAPUtils/features/metadata/metaCreatorReducer';
import { useDispatch } from 'react-redux';

const ClusteringProcess = ({ worker, setProgress, attributes, close, isModalOpen }) => {
  const dispatch = useDispatch();

  // Config Variables
  const [distance, setDistance] = useState('euclidean');
  const [maxDepth, setMaxDepth] = useState(8);
  const [pruneThres, setPruneTress] = useState(0);

  const [isValid, setValid] = useState(true);
  // Loading Status
  const [modelLoaded, setModelLoaded] = useState(false);
  const [embeddingStatus, setEmbeddingStatus] = useState(false);
  const [clusteringStatus, setClusteringStatus] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [final, setFinal] = useState(null);

  // Progress Status
  useEffect(() => {
    const onMessageReceived = async (event) => {
      switch (event.data.status) {
        case 'state':
          if (event.data.name === 'model') {
            setModelLoaded(event.data.loaded);
          } else if (event.data.name === 'embeddings') {
            setEmbeddingStatus(event.data.loaded);
          } else if (event.data.name === 'clustering') {
            setClusteringStatus(event.data.loaded);
          }
          break;
        case 'initiate':
          setProgress((prev) => [...prev, event.data]);
          break;
        case 'progress':
          setProgress((prev) =>
            prev.map((i) => {
              if (i.file === event.data.file) {
                return { ...i, progress: event.data.progress };
              } else {
                return i;
              }
            })
          );
          break;

        case 'done':
          setProgress((p) => p.filter((i) => i.file !== event.data.file));
          break;

        case 'return':
          setFinal(event.data.data);
          console.log(event.data.data);
          if (
            confirm(
              'Are you sure you want to change the set aggregations? This action cannot be undone.'
            )
          ) {
            await dispatch(CreateToMeta(event.data.data));
            close();
            setModelLoaded(false);
            setEmbeddingStatus(false);
            setClusteringStatus(false);
            setSavingStatus(true);
          }
          break;

        default:
          break;
      }
    };

    worker.addEventListener('message', onMessageReceived);
    return () => {
      worker.removeEventListener('message', onMessageReceived);
    };
  });

  // set initial model loaded state
  useState(() => {
    console.log('renderizado inicial');
  }, []); // only one

  const createHierarchy = (event) => {
    // reset state
    setEmbeddingStatus(false);
    setClusteringStatus(false);
    setSavingStatus(false);
    setFinal(null);

    // initiate the process
    worker.postMessage({
      data: attributes,
      action: 'clustering',
      config: {
        distance: distance,
        maxDepth: maxDepth,
        thress: pruneThres
      }
    });
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
      <div
        style={{
          flexGrow: 1,
          height: '100%',
          paddingBottom: '0.75rem',
          paddingRight: '0.5rem',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div style={{ overflowY: 'scroll', marginTop: '0.75rem', flexGrow: 1 }}>
          <p>
            Creation of Hierarchy through the use of semantic similarities obtained through AI
            techniques.
          </p>
          <CustomDetails title="Configurtion (Advanced)">
            <p
              style={{
                color: '#4B5563',
                fontSize: '1rem',
                marginLeft: '0.5rem',
                marginBottom: '0.5rem'
              }}
            >
              <span style={{ fontWeight: 'bold', color: '#1F2937', marginLeft: '0.25rem' }}>
                This process is NOT deterministic.
              </span>
            </p>
            <div style={{ marginLeft: '0.5rem' }}>
              <label htmlFor="hier-emb-distance">Distance Function:</label>
              <select
                name="hier-emb-distance"
                onChange={(event) => setDistance(event.target.value)}
                defaultValue={distance}
              >
                <option value="euclidean">Euclidean Distance</option>
                <option value="cosine">Cosine Similarity</option>
              </select>
            </div>
            <div style={{ marginLeft: '0.5rem', marginTop: '0.5rem' }}>
              <label htmlFor="hier-emb-depth">Max Hierarchy Height:</label>
              <input
                type="number"
                min="1"
                max="100"
                name="hier-emb-depth"
                onChange={(event) => {
                  const val = event.target.value;
                  if (val < 1 || val > 50) {
                    setValid(false);
                  } else {
                    setValid(true);
                  }
                  setMaxDepth(event.target.value);
                }}
                style={{
                  paddingLeft: '1rem',
                  paddingRight: '1rem',
                  marginLeft: '0.75rem',
                  backgroundColor: 'transparent',
                  width: '5rem',
                  textAlign: 'center',
                  color: 'black',
                  border: '1px solid #4B5563',
                  borderRadius: '0.375rem'
                }}
                defaultValue={maxDepth}
              />
              <span
                style={{
                  color: '#EF4444',
                  marginLeft: '0.5rem',
                  display: isValid ? 'none' : 'inline'
                }}
              >
                Only values between 1 - 20 due to performance.
              </span>
            </div>
            <div style={{ marginLeft: '0.5rem' }}>
              <label htmlFor="hier-emb-distance">Pruning Aggressiveness</label>
              <select
                name="hier-emb-prune"
                onChange={(event) => setPruneTress(parseFloat(event.target.value))}
                defaultValue={pruneThres}
              >
                <option value={0}>None</option>
                <option value={0.25}>Low</option>
                <option value={0.3}>Medium</option>
                <option value={0.8}>High</option>
              </select>
            </div>
          </CustomDetails>
        </div>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <button
            disabled={!isValid}
            onClick={createHierarchy}
            style={{
              margin: '0 auto',
              backgroundColor: isValid ? '#3B82F6' : '#9CA3AF',
              cursor: isValid ? 'pointer' : 'not-allowed',
              paddingLeft: '2rem',
              paddingRight: '2rem',
              paddingTop: '0.25rem',
              paddingBottom: '0.25rem',
              fontSize: '1.125rem',
              color: 'white',
              borderRadius: '0.5rem',
              textAlign: 'center'
            }}
          >
            Run
          </button>
        </div>
      </div>
      <div
        style={{
          marginBottom: '1rem',
          borderRight: '2px dashed',
          borderColor: '#9CA3AF',
          opacity: 0.3,
          backgroundColor: 'black',
          width: '1px',
          height: '100%'
        }}
      ></div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          padding: '0.75rem 1rem 0.75rem 1.5rem',
          flexGrow: 0,
          flexShrink: 0
        }}
      >
        <h3 style={{ fontWeight: 'bold', color: 'black', fontSize: '1.25rem' }}>Steps:</h3>
        <StatusMarker name={'Carga Modelo'} status={modelLoaded}>
          Charge Model
        </StatusMarker>
        <StatusMarker name={'Cálculo Embeddings'} status={embeddingStatus}>
          Computing <span style={{ fontStyle: 'italic' }}>Embeddings</span>
        </StatusMarker>
        <StatusMarker status={clusteringStatus}>Computing Hierarchy</StatusMarker>
        {/* <StatusMarker status={savingStatus}>Result Saved</StatusMarker> */}
      </div>
    </div>
  );
};

export default ClusteringProcess;
