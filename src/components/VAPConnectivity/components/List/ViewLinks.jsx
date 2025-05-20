import React, { useEffect } from 'react';
import { Button, Popover, Table, ConfigProvider } from 'antd';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as d3 from 'd3';
import DataManager from '../../managers/DataManager';
import store from '@/components/VAPUtils/features/store';
import { setLinks as setAtlasLinks } from '@/components/VAPUtils/features/atlas/atlasSlice';
import { createStyles } from 'antd-style';
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { SortIcon } from '@/components/SortIcon';

const utils = DataManager.getInstance();

const zscore_scale = d3.scaleSequential().interpolator(d3.interpolateRdBu).domain([-5, 5]);

const plv_scale = d3.scaleSequential().interpolator(d3.interpolateBlues).domain([0, 1]);

const decimals = 3;
const pageSize = 7;

const useStyles = createStyles(({ token, css: _css }) => ({
  panel: {
    backgroundColor: 'white'
  },
  rowLight: {
    backgroundColor: 'white'
  },
  rowDark: {
    backgroundColor: '#f8f8f8'
  },
  headerColor: {
    color: token.colorPrimary
  },
  buttonRow: {
    color: 'black',
    padding: 0,
    margin: 0
  },
  errorMsg: {
    color: 'red'
  }
}));

const ViewLinks = ({ slice, setLinks, setters }) => {
  const dispatch = useDispatch();
  const links = useSelector((state) => state[slice].links);
  const link_attrs = useSelector((state) => state.list.link_attrs);
  const selected_atlas = useSelector((state) => state.atlas.selected_atlas);
  const selected_ids = useSelector((state) => state.atlas.selected_ids);
  const columns = selected_atlas ? getListColumns(link_attrs) : []; // vendran de lists habra una seleccion de columnas similar para todas las listas
  const [selected_links, setSelectedLinks] = useState([]);
  const { theme, styles } = useStyles();

  useEffect(() => {
    const new_links = links.filter(
      (link) => selected_ids.includes(link.x_node) && selected_ids.includes(link.y_node)
    );
    dispatch(setLinks(new_links));
    return () => {};
  }, [selected_ids]);

  useEffect(() => {
    const links_2_show = links.filter((link) => selected_links.includes(link.key));
    dispatch(setAtlasLinks(links_2_show));
  }, [links]);

  const onShowLinksInAtlas = () => {
    const links_2_show = links.filter((link) => selected_links.includes(link.key));
    dispatch(setAtlasLinks(links_2_show));
    /* const data = { links: links_2_show };
    const msg = utils.generateMsg(EVENTS.SHOW_LINKS_IN_ATLAS, data);
    utils.getAtlasChannel().postMessage(msg); */
  };

  const onChange = (new_items) => {
    setSelectedLinks(new_items);
  };

  const rowSelection = {
    onChange: onChange
  };

  const onClear = () => {
    dispatch(setLinks([]));
  };

  const onDeleteSelected = () => {
    const filtered_links = links.filter((link) => !selected_links.includes(link.key));

    dispatch(setLinks(filtered_links));
  };

  const onSetLinks = (setter) => () => {
    const filtered_links = links.filter((link) => selected_links.includes(link.key));

    dispatch(setter(filtered_links));
  };

  const onAddLinks = (adder) => () => {
    const filtered_links = links.filter((link) => selected_links.includes(link.key));

    dispatch(adder(filtered_links));
  };

  const convertToCSV = (array) => {
    const header = Object.keys(array[0]).join(',');
    const rows = array.map((obj) => Object.values(obj).join(',')).join('\n');
    return `${header}\n${rows}`;
  };

  const downloadCSV = () => {
    const formatted_links = manageDownloadLinks(links);
    const csv = convertToCSV(formatted_links);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'link_data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const onDownloadLinks = () => {
    downloadCSV();
  };

  return (
    <ConfigProvider
      theme={{
        components: {
          Table: {
            headerBg: 'white',
            headerColor: theme.colorPrimary
          }
        }
      }}
    >
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflowY: 'auto',
          overflow: 'hidden',
          background: 'white',
          padding: '0'
        }}
      >
        <Table
          size={'small'}
          bordered={true}
          style={{ height: '94%', overflow: 'scroll' }}
          rowSelection={rowSelection}
          columns={columns}
          rowClassName={(_record, index) => (index % 2 === 0 ? styles.rowDark : styles.rowLight)}
          dataSource={manageLinks(links, link_attrs)}
          pagination={{
            pageSizeOptions: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
            defaultPageSize: pageSize,
            showSizeChanger: true
          }}
        />

        <div
          style={{
            padding: '5px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-evenly'
          }}
        >
          <div
            style={{
              padding: '5px',
              width: '100%',
              display: 'flex',
              justifyContent: 'space-evenly'
            }}
          >
            <Button onClick={onDownloadLinks} type="primary">
              Download
            </Button>

            <Button onClick={onDeleteSelected} type="primary">
              Delete Selection
            </Button>
            <Button type="primary" onClick={onClear}>
              Delete All
            </Button>
            <Button onClick={onShowLinksInAtlas} type="primary">
              Show Selection in Atlas
            </Button>
          </div>

          <div
            style={{
              padding: '5px',
              width: '100%',
              display: 'flex',
              justifyContent: 'space-evenly'
            }}
          >
            {setters?.map((setter, i) => (
              <>
                <Button key={'set' + i} onClick={onSetLinks(setter.setLinks)} type="primary">
                  Set Selection in {setter.app}
                </Button>

                <Button key={'add' + i} onClick={onAddLinks(setter.addLinks)} type="primary">
                  Add Selection to {setter.app}
                </Button>
              </>
            ))}
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default ViewLinks;

function getAllAttrs() {
  const types = store.getState().main.types;
  const measures = store.getState().main.measures;
  const bands = store.getState().main.bands;

  console.log(bands);

  const all_attrs = [];
  types.forEach((type) => {
    measures.forEach((measure) => {
      bands.forEach((band) => {
        const attr = { type, measure, band };
        all_attrs.push(attr);
      });
    });
  });

  return all_attrs;
}

function manageDownloadLinks(links) {
  const statistical_acronims = store.getState().main.statistics.map((s) => s.acronim);

  const attrs = getAllAttrs();
  const dictionary = utils.getAcronymOrderDictionary();

  const formatted_links = links.map((link) => {
    const col = {};
    attrs.forEach((attr) => {
      const dataIndex = attr.type.acronim + '-' + attr.measure.acronim + '-' + attr.band.acronim;

      const x_index = dictionary[link.x_node];
      const y_index = dictionary[link.y_node];
      let mean = utils.getMeanMatrixValueNoFilter(attr, x_index, y_index);

      if (!statistical_acronims.includes(attr.band.acronim) && attr.type.acronim != 'zscore') {
        let std = utils.getStdMatrixValueNoFilter(attr, x_index, y_index);

        col[dataIndex + '-mean'] = mean;
        col[dataIndex + '-std'] = std;
      } else {
        col[dataIndex] = mean;
      }
    });

    return { ...link, ...col };
  });

  console.log(formatted_links);
  return formatted_links;
}

// worker
function manageLinks(links, attrs) {
  const statistical_acronims = store.getState().main.statistics.map((s) => s.acronim);
  const formatted_links = links.map((link) => {
    const col = {};
    attrs.forEach((attr) => {
      const dataIndex = attr.type.acronim + attr.measure.acronim + attr.band.acronim;

      const x_index = utils.getMatrixIndexByAcronim(link.x_node);
      const y_index = utils.getMatrixIndexByAcronim(link.y_node);

      let mean = utils.getMeanMatrixValueNoFilter(attr, x_index, y_index);
      console.log(attr, x_index, y_index);
      let text = mean.toFixed(decimals);
      let measure = attr.measure.acronim;

      // this needs to be managed better
      if (attr.type.acronim == 'zscore') {
        measure = 'zscore';
      } else if (!statistical_acronims.includes(attr.band.acronim)) {
        let std = utils.getStdMatrixValueNoFilter(attr, x_index, y_index).toFixed(decimals);
        text += ' ± ' + std;
      }
      col[dataIndex] = { text: text, value: mean, measure: measure };
    });

    return { ...link, ...col };
  });

  console.log(formatted_links);
  return formatted_links;
}

function generateColumnRender(item) {
  let scale;
  if (item.measure == 'zscore') {
    scale = zscore_scale;
  } else {
    scale = plv_scale;
  }

  console.log(item);
  return {
    children: (
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          fontWeight: 'bold',
          //border: "1px solid black",
          textAlign: 'center',
          height: '50px',
          width: '100%',
          gap: '10px'
        }}
      >
        <div
          style={{
            height: '100%',
            aspectRatio: 1,
            background: `${scale(item.value)}`
          }}
        >
          {' '}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
          {item.text}
        </div>
      </div>
    )
  };
}

function getListColumns(attrs) {
  const colors = utils.getNodeLobuleColors();
  const node_to_name = utils.getNodeToName();

  let columns = [
    {
      title: 'ROI',
      dataIndex: 'x_node',
      sortIcon: SortIcon,
      render(text, record) {
        return (
          <Popover title={'Name'} content={node_to_name[text]}>
            <div on style={{ background: colors[text], flex: 1, textAlign: 'center' }}>
              {text}
            </div>
          </Popover>
        );
      }
    },
    {
      title: 'ROI',
      dataIndex: 'y_node',
      render(text, record) {
        return (
          <Popover title={'Name'} content={node_to_name[text]}>
            <div on style={{ background: colors[text], flex: 1, textAlign: 'center' }}>
              {text}
            </div>
          </Popover>
        );
      }
    }
  ];

  attrs.forEach((d) => {
    const dataIndex = d.type.acronim + d.measure.acronim + d.band.acronim;

    const item = {
      title: ` ${d.type.name}  ${d.measure.name}  ${d.band.name}`,
      dataIndex: dataIndex,
      sortIcon: SortIcon,
      sorter: (a, b) => {
        return a[dataIndex].value - b[dataIndex].value;
      },
      render(text, record) {
        return generateColumnRender(text);
      }
    };
    columns.push(item);
  });

  return columns;
}
