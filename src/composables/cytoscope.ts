import { ComputedRef, Ref, ref, onMounted, watch } from "vue";
import { NodeState, NodeData } from "graphai/lib/type";
import { GraphData } from "graphai";

import cytoscape, { Core, NodeSingular, NodeDefinition, EdgeDefinition, EdgeSingular } from "cytoscape";
// import fcose from "cytoscape-fcose";
// cytoscape.use(fcose);
import klay from "cytoscape-klay";
cytoscape.use(klay);
const layout = "klay";

import { sleep } from "@/utils/utils";

const colorPriority = "#f80";
const colorStatic = "#88f";

const calcNodeWidth = (label: string) => {
  if (label === null || label === undefined) {
    return "50px";
  }
  return Math.max(50, label.length * 8) + "px";
};

const cyStyle = [
  {
    selector: "node",
    style: {
      "background-color": "data(color)",
      label: "data(id)",
      shape: (ele: NodeSingular) => (ele.data("isStatic") ? "rectangle" : "roundrectangle"),
      width: (ele: EdgeSingular) => calcNodeWidth(ele.data("id")),
      color: "#fff",
      height: "30px",
      "text-valign": "center" as const,
      "text-halign": "center" as const,
      "font-size": "12px",
    },
  },
  {
    selector: "edge",
    style: {
      width: 3,
      "line-color": "#888",
      "target-arrow-color": "#888",
      "target-arrow-shape": "triangle",
      "curve-style": "straight" as const,
      "text-background-color": "#ffffff",
      "text-background-opacity": 0.8,
      "text-background-shape": "rectangle" as const,
      "font-size": "10px",
    },
  },
  {
    selector: "edge[label]",
    style: {
      label: "data(label)",
    },
  },
  {
    selector: "edge[isUpdate]",
    style: {
      color: "#ddd",
      "line-color": "#ddd",
      "line-style": "dashed",
      "curve-style": "unbundled-bezier" as const,
      "target-arrow-color": "#ddd",
    },
  },
];

const colorMap = {
  [NodeState.Waiting]: "#888",
  [NodeState.Completed]: "#000",
  [NodeState.Executing]: "#0f0",
  [NodeState.Queued]: "#ff0",
  [NodeState.Injected]: "#00f",
  [NodeState.TimedOut]: "#f0f",
  [NodeState.Failed]: "#f00",
  [NodeState.Skipped]: "#0ff",
};

const parseInput = (input: string) => {
  // WARNING: Assuming the first character is always ":"
  const ids = input.slice(1).split(".");
  const source = ids.shift() || "";
  const label = ids.length ? ids.join(".") : undefined;
  return { source, label };
};

const cytoscapeFromGraph = (graph_data: GraphData) => {
  const elements = Object.keys(graph_data.nodes).reduce(
    (tmp: { nodes: NodeDefinition[]; edges: EdgeDefinition[]; map: Record<string, NodeDefinition> }, nodeId) => {
      const node: NodeData = graph_data.nodes[nodeId];
      const isStatic = "value" in node;
      const cyNode = {
        data: {
          id: nodeId,
          color: isStatic ? colorStatic : colorMap[NodeState.Waiting],
          isStatic,
        },
      };
      tmp.nodes.push(cyNode);
      tmp.map[nodeId] = cyNode;
      if ("inputs" in node) {
        // computed node
        (node.inputs ?? []).forEach((input: string) => {
          const { source, label } = parseInput(input);
          tmp.edges.push({
            data: {
              source,
              target: nodeId,
              label,
            },
          });
        });
      }
      if ("update" in node && node.update) {
        // static node
        const { source, label } = parseInput(node.update);
        tmp.edges.push({
          data: {
            source,
            target: nodeId,
            isUpdate: true,
            label,
          },
        });
      }
      return tmp;
    },
    { nodes: [], edges: [], map: {} },
  );
  return { elements };
};

export const useCytoscope = (selectedGraph: ComputedRef<GraphData> | Ref<GraphData>) => {
  let cy: null | Core = null;

  const cytoscopeData = ref(cytoscapeFromGraph(selectedGraph.value));
  const cytoscopeRef = ref();

  const updateCytoscope = async (nodeId: string, state: NodeState) => {
    if (state === NodeState.Completed || state === NodeState.Waiting) {
      await sleep(100);
    }
    const elements = cytoscopeData.value.elements;
    elements.map[nodeId].data.color = colorMap[state];
    const graph = selectedGraph.value;
    const nodeData = graph.nodes[nodeId];
    if ("agent" in nodeData && state === NodeState.Queued && (nodeData.priority ?? 0) > 0) {
      // computed node
      elements.map[nodeId].data.color = colorPriority;
    } else {
      if ("value" in nodeData && state === NodeState.Waiting) {
        // static node
        elements.map[nodeId].data.color = colorStatic;
      }
    }
    cytoscopeData.value = { elements };
    if (state === NodeState.Injected) {
      await sleep(100);
      elements.map[nodeId].data.color = colorStatic;
      cytoscopeData.value = { elements };
    }
  };

  const createCytoscope = () => {
    try {
      cy = cytoscape({
        container: cytoscopeRef.value,
        style: cyStyle,
        layout: {
          name: layout,
          // fit: true,
          // padding: 30,
          // avoidOverlap: true,
        },
      });
      cy.on("mouseup", storePositions);
      cy.on("touchend", storePositions);
      // cy.on("select", "node", callback);
      // cy.on("select", "edge", callback);
      //store.commit("setCytoscape", cy);
    } catch (error) {
      console.error(error);
      // store.commit("setCytoscape", null);
      // error_msg.value = `${error}`;
    }
  };
  const updateGraphData = async () => {
    if (cy) {
      cy.elements().remove();
      cy.add(cytoscopeData.value.elements);
      const name = cytoscopeData.value.elements.nodes.reduce((prevName: string, node: NodeDefinition) => {
        if (node.position) {
          return "preset";
        }
        return prevName;
      }, layout);
      console.log("layout", name);
      cy.layout({ name }).run();
      cy.fit();
      if (name === layout) {
        await sleep(400);
        storePositions();
      }
    }
  };

  const storePositions = () => {
    console.log("storePositions");
    if (cy) {
      cy.nodes().forEach((cynode: NodeSingular) => {
        const id = cynode.id();
        const pos = cynode.position();
        const node = cytoscopeData.value.elements.map[id];
        node.position = pos;
      });
    }
  };

  const resetCytoscope = () => {
    const elements = cytoscopeData.value.elements;
    Object.keys(elements.map).forEach((nodeId) => {
      const graph = selectedGraph.value;
      const nodeData = graph.nodes[nodeId];
      elements.map[nodeId].data.color = "value" in nodeData ? colorStatic : colorMap[NodeState.Waiting];
    });
    cytoscopeData.value = { elements };
  };

  watch(cytoscopeData, () => {
    console.log("updated");
    updateGraphData();
  });

  watch(selectedGraph, () => {
    cytoscopeData.value = cytoscapeFromGraph(selectedGraph.value);
  });

  onMounted(() => {
    createCytoscope();
    updateGraphData();
  });

  return {
    cytoscopeRef,
    updateCytoscope,
    resetCytoscope,
  };
};
