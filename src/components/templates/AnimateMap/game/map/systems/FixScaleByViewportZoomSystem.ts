import { Engine, NodeList, System } from "@ash.ts/ash";

import { FixScaleByViewportZoomNode } from "../nodes/FixScaleByViewportZoomNode";
import { ViewportNode } from "../nodes/ViewportNode";

export class FixScaleByViewportZoomSystem extends System {
  private nodes?: NodeList<FixScaleByViewportZoomNode>;
  private viewport?: NodeList<ViewportNode>;

  private currentZoomViewport = -1;
  private currentZoomLevel = -1;
  private zoomUpdated = true;

  addToEngine(engine: Engine) {
    this.viewport = engine.getNodeList(ViewportNode);
    this.viewport.nodeAdded.add(this.handleViewportAdded);

    this.nodes = engine.getNodeList(FixScaleByViewportZoomNode);
    this.nodes.nodeAdded.add(this.nodeAdded);
  }

  removeFromEngine(engine: Engine) {
    if (this.viewport) {
      this.viewport.nodeAdded.remove(this.handleViewportAdded);
      this.viewport = undefined;
    }

    if (this.nodes) {
      this.nodes.nodeAdded.remove(this.nodeAdded);
      this.nodes = undefined;
    }
  }

  update(time: number) {
    if (this.zoomUpdated && this.viewport?.head) {
      this.zoomUpdated = false;
      this.currentZoomViewport = this.viewport.head.viewport.zoomViewport;
      this.currentZoomLevel = this.viewport.head.viewport.zoomLevel;

      for (
        let node: FixScaleByViewportZoomNode | null | undefined = this.nodes
          ?.head;
        node;
        node = node.next
      ) {
        this.updateNode(node);
      }
    }
  }

  private updateNode(node: FixScaleByViewportZoomNode) {
    const position = node.position;
    const scale =
      node.fixSize.scales[this.currentZoomLevel] / this.currentZoomViewport;
    position.scaleX = position.scaleY = scale;
  }

  private handleViewportAdded = (node: ViewportNode) => {
    if (
      node.viewport.zoomViewport !== this.currentZoomViewport ||
      node.viewport.zoomLevel !== this.currentZoomLevel
    ) {
      this.zoomUpdated = true;
    }
  };

  public nodeAdded = (node: FixScaleByViewportZoomNode) => {
    this.updateNode(node);
  };

  public nodeRemoved = (node: FixScaleByViewportZoomNode) => {};
}
