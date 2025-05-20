import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { pubsub } from '@/components/VAPUtils/pubsub';
import { setScenarioRunId } from '@/components/VAPUtils/features/main/mainSlice';
import { setDescriptions, setSelectedIds } from '@/components/VAPUtils/features/cantab/cantabSlice';
import { updateFromJSON } from '@/components/VAPUtils/features/data/dataSlice';

const { publish } = pubsub;

const useScenarioRun = (loadHierarchy) => {
  const dispatch = useDispatch();
  const scenarioRunId = useSelector((state) => state.main.scenarioRunId);

  const handleScenarioRun = async (id) => {
    try {
      const { data, ids, descriptions } = await api.fetchScenarioRunData(id);
      await loadHierarchy();
      dispatch(updateFromJSON(data));
      dispatch(setSelectedIds(ids));
      dispatch(setDescriptions(descriptions));
    } catch (error) {
      console.error(`Error retrieving ScenarioRun (id:${id})`, error);
      publish('notification', {
        message: `Error retrieving ScenarioRun (id:${id})`,
        description: error.message,
        type: 'error'
      });
    } finally {
      dispatch(setScenarioRunId(null));
    }
  };

  useEffect(() => {
    if (scenarioRunId) {
      handleScenarioRun(scenarioRunId);
    }
  }, [scenarioRunId]);
};

export default useScenarioRun;
