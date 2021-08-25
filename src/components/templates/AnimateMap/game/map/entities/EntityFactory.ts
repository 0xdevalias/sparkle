import { Engine, Entity, NodeList } from "@ash.ts/ash";
import { Sprite } from "pixi.js";

import {
  PlayerModel,
  ReplicatedUser,
  ReplicatedVenue,
} from "store/reducers/AnimateMap";

import { Point } from "types/utility";

import { GameConfig, GameOptionsFirebarrel } from "../../../configs/GameConfig";
import { ImageToCanvas } from "../../commands/ImageToCanvas";
import { LoadImage } from "../../commands/LoadImage";
import { RoundAvatar } from "../../commands/RoundAvatar";
import { avatarCycles, HALO } from "../../constants/AssetConstants";
import { GameInstance } from "../../GameInstance";
import { AnimationComponent } from "../components/AnimationComponent";
import { ArtcarComponent } from "../components/ArtcarComponent";
import { AvatarTuningComponent } from "../components/AvatarTuningComponent";
import { BarrelComponent } from "../components/BarrelComponent";
import { BotComponent } from "../components/BotComponent";
import { BubbleComponent } from "../components/BubbleComponent";
import { CollisionComponent } from "../components/CollisionComponent";
import { EllipseComponent } from "../components/EllipseComponent";
import { HoverableSpriteComponent } from "../components/HoverableSpriteComponent";
import { JoystickComponent } from "../components/JoystickComponent";
import { KeyboardComponent } from "../components/KeyboardComponent";
import { MotionBotClickControlComponent } from "../components/MotionBotClickControlComponent";
import { MotionBotIdleComponent } from "../components/MotionBotIdleComponent";
import { MotionControlSwitchComponent } from "../components/MotionControlSwitchComponent";
import { MotionKeyboardControlComponent } from "../components/MotionKeyboardControlComponent";
import { MovementComponent } from "../components/MovementComponent";
import { PlayerComponent } from "../components/PlayerComponent";
import { PositionComponent } from "../components/PositionComponent";
import { SoundEmitterComponent } from "../components/SoundEmitterComponent";
import { SpriteComponent } from "../components/SpriteComponent";
import { TooltipComponent } from "../components/TooltipComponent";
import { ViewportComponent } from "../components/ViewportComponent";
import { ViewportFollowComponent } from "../components/ViewportFollowComponent";
import { FSMBase } from "../finalStateMachines/FSMBase";
import { Avatar } from "../graphics/Avatar";
import { Barrel } from "../graphics/Barrel";
import { Venue } from "../graphics/Venue";
import { VenueHoverIn } from "../graphics/VenueHoverIn";
import { VenueHoverOut } from "../graphics/VenueHoverOut";
import { AvatarTuningNode } from "../nodes/AvatarTuningNode";
import { BotNode } from "../nodes/BotNode";
import { JoystickNode } from "../nodes/JoystickNode";
import { KeyboardNode } from "../nodes/KeyboardNode";
import { MotionBotControlNode } from "../nodes/MotionBotControlNode";
import { PlayerNode } from "../nodes/PlayerNode";
import { ViewportNode } from "../nodes/ViewportNode";

import { createVenueEntity } from "./createVenueEntity";

export default class EntityFactory {
  private engine: Engine;

  constructor(engine: Engine) {
    this.engine = engine;
  }

  public getPlayerNode(): PlayerNode | null | undefined {
    return this.engine.getNodeList(PlayerNode).head;
  }

  public getBotNode(id: string): BotNode | null {
    const bots: NodeList<BotNode> | undefined = this.engine.getNodeList(
      BotNode
    );
    for (
      let bot: BotNode | null | undefined = bots?.head;
      bot;
      bot = bot.next
    ) {
      if (bot.bot.data.data.id === id) {
        return bot;
      }
    }
    return null;
  }

  public createViewport(com: ViewportComponent): Entity {
    const nodelist: NodeList<ViewportNode> = this.engine.getNodeList(
      ViewportNode
    );
    while (nodelist.head) {
      this.removeEntity(nodelist.head.entity);
    }
    const entity: Entity = new Entity().add(com);
    this.engine.addEntity(entity);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    return nodelist.head.entity;
  }

  public updateViewport(comm?: ViewportComponent) {
    const nodelist: NodeList<ViewportNode> = this.engine.getNodeList(
      ViewportNode
    );
    if (!nodelist.head) {
      return;
    }
    nodelist.head.entity.add(comm ? comm : nodelist.head.viewport);
  }

  public createJoystick(comm: JoystickComponent): Entity {
    const nodelist: NodeList<JoystickNode> = this.engine.getNodeList(
      JoystickNode
    );
    while (nodelist.head) {
      this.removeEntity(nodelist.head.entity);
    }

    const entity: Entity = new Entity().add(comm);
    this.engine.addEntity(entity);
    return entity;
  }

  public updateJoystick(comm?: JoystickComponent) {
    const nodelist: NodeList<JoystickNode> = this.engine.getNodeList(
      JoystickNode
    );
    if (!nodelist.head) {
      return;
    }
    nodelist.head.entity.add(comm ? comm : nodelist.head.joystick);
  }

  public createKeyboard(
    comm: KeyboardComponent,
    control: MotionKeyboardControlComponent
  ): Entity {
    const nodelist: NodeList<KeyboardNode> = this.engine.getNodeList(
      KeyboardNode
    );
    while (nodelist.head) {
      this.removeEntity(nodelist.head.entity);
    }

    const entity: Entity = new Entity().add(comm).add(control);
    this.engine.addEntity(entity);
    return entity;
  }

  public updateKeyboard(comm: KeyboardComponent) {
    const nodelist: NodeList<KeyboardNode> = this.engine.getNodeList(
      KeyboardNode
    );
    if (!nodelist.head) {
      return;
    }
    nodelist.head.entity.add(comm ? comm : nodelist.head.keyboard);
  }

  public createBubble(userId: string, text: string): Entity | null {
    const bot: BotNode | null = this.getBotNode(userId);
    if (bot) {
      bot.entity.add(new BubbleComponent(text, bot.bot.data.data.dotColor));
      return bot.entity;
    }
    return null;
  }

  public removeBubble(entity: Entity) {
    entity.remove(BubbleComponent);
  }

  public createPlayer(user: ReplicatedUser): Entity {
    let avatarUrlString = user.data.avatarUrlString;

    if (!Array.isArray(avatarUrlString)) {
      avatarUrlString = [avatarUrlString];
    }

    // HACK
    user.data.cycle = avatarCycles[0];

    const movementComponent = new MovementComponent();
    const motionControl = new MotionControlSwitchComponent();
    const collision: CollisionComponent = new CollisionComponent(0);

    const scale = 0.2;

    const entity: Entity = new Entity();
    const fsm: FSMBase = new FSMBase(entity);
    const player = new PlayerComponent(user, fsm);

    fsm.createState(player.IMMOBILIZED);

    fsm
      .createState(player.FLYING)
      .add(CollisionComponent)
      .withInstance(collision)
      .add(MovementComponent)
      .withInstance(movementComponent)
      .add(MotionControlSwitchComponent)
      .withInstance(motionControl);

    fsm
      .createState(player.CYCLING)
      .add(CollisionComponent)
      .withInstance(collision)
      .add(MovementComponent)
      .withInstance(movementComponent)
      .add(MotionControlSwitchComponent)
      .withInstance(motionControl);

    fsm
      .createState(player.WALKING)
      .add(CollisionComponent)
      .withInstance(collision)
      .add(MovementComponent)
      .withInstance(movementComponent)
      .add(MotionControlSwitchComponent)
      .withInstance(motionControl);

    entity
      .add(movementComponent)
      .add(motionControl)
      .add(player)
      .add(new PositionComponent(user.x, user.y, 0, scale, scale))
      .add(new ViewportFollowComponent());

    fsm.changeState("flying");
    this.engine.addEntity(entity);

    const url = avatarUrlString.length > 0 ? avatarUrlString[0] : "";
    const sprite: Avatar = new Avatar();
    new RoundAvatar(url)
      .execute()
      .then((comm: RoundAvatar) => {
        if (!comm.canvas) return Promise.reject();

        // avatar
        sprite.avatar = Sprite.from(comm.canvas);
        sprite.avatar.anchor.set(0.5);
        sprite.addChild(sprite.avatar);

        return Promise.resolve(comm);
      })
      .then((comm: RoundAvatar) => {
        if (!comm.canvas) return Promise.reject();

        const spriteComponent: SpriteComponent = new SpriteComponent();
        spriteComponent.view = sprite;
        entity.add(spriteComponent);
      });

    return entity;
  }

  public createArtcar(user: ReplicatedUser): Entity {
    let avatarUrlString = user.data.avatarUrlString;

    if (!Array.isArray(avatarUrlString)) {
      avatarUrlString = [avatarUrlString];
    }

    const scale = 0.3;

    const config = GameInstance.instance.getConfig();
    const innerRadius = config.venuesMainCircleOuterRadius;
    const outerRadius = config.borderRadius;
    const worldCenter: Point = config.worldCenter;

    const angle = this.getRandomNumber(0, 360) * (Math.PI / 180);
    const radiusX = this.getRandomNumber(innerRadius, outerRadius);
    const radiusY = this.getRandomNumber(innerRadius, outerRadius);

    user.x = worldCenter.x + Math.cos(angle) * radiusX;
    user.y = worldCenter.y + Math.sin(angle) * radiusY;

    const entity: Entity = new Entity();
    const fsm: FSMBase = new FSMBase(entity);
    fsm
      .createState("moving")
      .add(MovementComponent)
      .withInstance(new MovementComponent())
      .add(EllipseComponent)
      .withInstance(
        new EllipseComponent(
          worldCenter.x,
          worldCenter.y,
          radiusX,
          radiusY,
          angle
        )
      );

    entity
      .add(new ArtcarComponent(user, fsm))
      .add(new PositionComponent(user.x, user.y, 0, scale, scale))
      .add(new HoverableSpriteComponent());

    fsm.changeState("moving");
    this.engine.addEntity(entity);

    const img: HTMLImageElement = new Image();
    const canvas: HTMLCanvasElement = document.createElement("canvas");
    const context: CanvasRenderingContext2D = canvas.getContext(
      "2d"
    ) as CanvasRenderingContext2D;
    new Promise((resolve) => {
      img.addEventListener("load", () => {
        canvas.width = img.height;
        canvas.height = img.width;
        const x = canvas.width / 2;
        const y = canvas.height / 2;
        const width = img.width;
        const height = img.height;
        context.translate(x, y);
        context.rotate(1.5708);
        context.drawImage(img, -width / 2, -height / 2, width, height);
        context.rotate(-1.5708);
        context.translate(-x, -y);

        resolve(true);
      });
      img.src = avatarUrlString[0];
    }).then(() => {
      const spriteComponent: SpriteComponent = new SpriteComponent();
      spriteComponent.view = Sprite.from(canvas);
      entity.add(spriteComponent);
    });

    return entity;
  }

  public updatePlayerTuning(node: PlayerNode) {
    node.entity.add(new AvatarTuningComponent(node.player.data));
  }

  public removePlayerTuning(node: PlayerNode) {
    node.entity.remove(AvatarTuningComponent);
  }

  public updateBotTuning(node: BotNode) {
    node.entity.add(new AvatarTuningComponent(node.bot.data));
  }

  public removeAvatarTuning(node: AvatarTuningNode) {
    node.entity.remove(AvatarTuningComponent);
  }

  public createBot(user: ReplicatedUser, realUser = false): Entity {
    let avatarUrlString = user.data.avatarUrlString;

    if (!Array.isArray(avatarUrlString)) {
      avatarUrlString = [avatarUrlString];
    }

    const point: Point = GameInstance.instance
      .getConfig()
      .playgroundMap.getRandomPointInTheCentralCircle();

    if (!realUser) {
      user.x = point.x;
      user.y = point.y;
    }

    const scale = 0.2;

    const entity: Entity = new Entity();
    const fsm: FSMBase = new FSMBase(entity);
    const bot = new BotComponent(user, fsm, realUser);

    fsm.createState(bot.IMMOBILIZED);

    fsm
      .createState(bot.IDLE)
      .add(MotionBotIdleComponent)
      .withInstance(new MotionBotIdleComponent());

    fsm
      .createState(bot.MOVING)
      .add(MotionBotClickControlComponent)
      .add(MovementComponent)
      .withInstance(new MovementComponent());

    entity
      .add(bot)
      .add(new PositionComponent(user.x, user.y, 0, scale, scale))
      .add(
        new HoverableSpriteComponent(
          () => {
            // add tooltip
            entity.add(
              new TooltipComponent(
                `bot id: ${user.data.id}`.slice(0, 15) + "...",
                15,
                "top"
              )
            );
          },
          () => {
            // remove tooltip
            entity.remove(TooltipComponent);
          }
        )
      );

    fsm.changeState("moving");
    this.engine.addEntity(entity);

    const url = avatarUrlString.length > 0 ? avatarUrlString[0] : "";
    const sprite: Avatar = new Avatar();

    new RoundAvatar(url)
      .execute()
      .then((comm: RoundAvatar) => {
        if (!comm.canvas) return Promise.reject();

        // avatar
        sprite.avatar = Sprite.from(comm.canvas);
        sprite.avatar.anchor.set(0.5);
        sprite.addChild(sprite.avatar);
        return Promise.resolve(comm);
      })
      .then((comm: RoundAvatar) => {
        if (!comm.canvas) return Promise.reject();

        const spriteComponent: SpriteComponent = new SpriteComponent();
        spriteComponent.view = sprite;
        entity.add(spriteComponent);
      });

    return entity;
  }

  public removeBot(entity: Entity) {
    this.engine.removeEntity(entity);
  }

  public removeBotById(id: string) {
    const list: NodeList<BotNode> = this.engine.getNodeList(BotNode);
    for (let bot: BotNode | null | undefined = list.head; bot; bot = bot.next) {
      if (bot.bot.data.data.id === id) {
        this.removeBot(bot.entity);
        return;
      }
    }
  }

  public updateBotPosition(user: ReplicatedUser, x: number, y: number) {
    const list: NodeList<BotNode> = this.engine.getNodeList(BotNode);
    for (let bot = list.head; bot; bot = bot.next) {
      if (bot.bot.data.data.id === user.data.id) {
        bot.bot.fsm.changeState("idle");
        bot.bot.fsm.changeState("moving");
        const node: MotionBotControlNode = this.engine.getNodeList(
          MotionBotControlNode
        ).tail as MotionBotControlNode;
        node.click.x = x;
        node.click.y = y;
        return;
      }
    }
  }

  public updateUserPositionById(userId: string, x: number, y: number) {
    let bot: BotNode | null = this.getBotNode(userId);
    if (!bot) {
      const player: PlayerModel = new PlayerModel(userId, -1, "", x, y);
      // player.data.id = userId;
      // player.x = x;
      // player.y = y;
      this.createBot(player, true);
      bot = this.engine.getNodeList(BotNode).head as BotNode;
      bot.bot.fsm.changeState("idle");
    } else {
      this.updateBotPosition(bot.bot.data, x, y);
    }
  }

  public removeUserById(id: string) {
    const node: BotNode | null = this.getBotNode(id);
    if (node) {
      this.removeEntity(node.entity);
    }
  }

  public createUser(hero: ReplicatedUser): Entity {
    const entity: Entity = new Entity().add(
      new PositionComponent(hero.x, hero.y)
    );

    this.engine.addEntity(entity);
    return entity;
  }

  public createBarrel(barrel: GameOptionsFirebarrel): Entity {
    const collisionRadius = GameConfig.VENUE_DEFAULT_COLLISION_RADIUS / 2;

    const entity: Entity = new Entity();
    entity
      .add(new BarrelComponent(barrel))
      .add(new CollisionComponent(collisionRadius))
      .add(
        new HoverableSpriteComponent(
          () => {
            const tooltip: TooltipComponent = new TooltipComponent(
              `Join to firebarrel`,
              0
            );
            tooltip.textColor = 0xffffff;
            tooltip.textSize = 14;
            tooltip.borderThikness = 0;
            tooltip.borderColor = 0;
            tooltip.backgroundColor = 0;
            // add tooltip
            entity.add(tooltip);
            // add increase
            const comm: SpriteComponent | null = entity.get(SpriteComponent);
            const duration = 100;
            if (comm) {
              entity.add(
                new AnimationComponent(
                  new VenueHoverIn(comm.view as Venue, duration),
                  duration
                )
              );
            }
          },
          () => {
            // remove tooltip
            entity.remove(TooltipComponent);
            // add decrease
            const comm: SpriteComponent | null = entity.get(SpriteComponent);
            const duration = 100;
            if (comm) {
              entity.add(
                new AnimationComponent(
                  new VenueHoverOut(comm.view as Venue, duration),
                  duration
                )
              );
            }
          }
        )
      );

    this.engine.addEntity(entity);

    new LoadImage(barrel.iconSrc)
      .execute()
      .then(
        (comm: LoadImage): Promise<ImageToCanvas> => {
          if (!comm.image) return Promise.reject();

          // the picture can be very large
          const scale = ((collisionRadius * 2) / comm.image.width) * 2;
          return new ImageToCanvas(comm.image).scaleTo(scale).execute();
        }
      )
      .then((comm: ImageToCanvas) => {
        const scale = (collisionRadius * 2) / comm.canvas.width / 2;
        if (barrel)
          entity.add(
            new PositionComponent(barrel.x, barrel.y, 0, scale, scale)
          );

        const sprite: Barrel = new Barrel();
        sprite.name = barrel.iconSrc;
        sprite.barrel = Sprite.from(comm.canvas);
        sprite.barrel.anchor.set(0.5);
        sprite.addChild(sprite.barrel);

        sprite.halo = Sprite.from(HALO);
        sprite.halo.anchor.set(0.5);
        sprite.zIndex = -1;
        sprite.addChildAt(sprite.halo, 0);

        const spriteComponent: SpriteComponent = new SpriteComponent();
        spriteComponent.view = sprite;

        entity.add(spriteComponent);
      })
      .catch((err) => {
        // TODO default venue image
        console.log("err", err);
      });

    return entity;
  }
  public createVenue(venue: ReplicatedVenue): Entity {
    return createVenueEntity(venue, this.engine);
  }

  public createSoundEmitter(
    x: number,
    y: number,
    radius: number,
    src: string
  ): Entity {
    const entity: Entity = new Entity()
      .add(new PositionComponent(x, y))
      .add(new SoundEmitterComponent(radius, src));
    this.engine.addEntity(entity);

    return entity;
  }

  public removeEntity(entity: Entity) {
    this.engine.removeEntity(entity);
  }

  public getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min) + min);
  }

  public setPlayerCameraFollow(value: boolean) {
    const playerEntity = this.getPlayerNode()?.entity;

    if (value && !playerEntity?.get(ViewportFollowComponent))
      playerEntity?.add(new ViewportFollowComponent());

    if (!value && playerEntity?.get(ViewportFollowComponent))
      playerEntity?.remove(ViewportFollowComponent);
  }
}