import { Room, Client } from "colyseus";
import { Schema, type, MapSchema } from "@colyseus/schema";

const STEP_SIZE = 25;

export class Player extends Schema {
    @type("number")
    x = Math.floor(Math.random() * 25) * STEP_SIZE;

    @type("number")
    y = Math.floor(Math.random() * 10) * STEP_SIZE;
}

export class State extends Schema {
    @type({ map: Player })
    players = new MapSchema<Player>();

    something = "This attribute won't be sent to the client-side";

    createPlayer(sessionId: string) {
        this.players.set(sessionId, new Player());
    }

    removePlayer(sessionId: string) {
        this.players.delete(sessionId);
    }

    movePlayer (sessionId: string, movement: any) {
        
        if (movement.x) {
            this.players.get(sessionId).x += movement.x * STEP_SIZE;

        } else if (movement.y) {
            this.players.get(sessionId).y += movement.y * STEP_SIZE;
        }
    }
}

export class StateHandlerRoom extends Room<State> {
    maxClients = 4;

    onCreate (options) {
        console.log("StateHandlerRoom created!", options);

        this.setState(new State());

        this.onMessage("move", (client, data) => {
            console.log("StateHandlerRoom received message from", client.sessionId, ":", data);
            setTimeout(() => {
                this.state.movePlayer(client.sessionId, data);
            }, 500)
        });
    }

    onAuth(client, options, req) {
        return true;
    }

    onJoin (client: Client) {
        client.send("hello", "world");
        this.state.createPlayer(client.sessionId);
    }

    onLeave (client) {
        this.state.removePlayer(client.sessionId);
    }

    onDispose () {
        console.log("Dispose StateHandlerRoom");
    }

}
