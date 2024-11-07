import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServiceChatService {

  private hubConnection: signalR.HubConnection;
  private connectionStarted = false; // Indicador de si la conexión ha comenzado correctamente
  private messageSource = new BehaviorSubject<{ user: string, message: string }>({ user: '', message: '' });
  currentMessage = this.messageSource.asObservable();

  constructor() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7147/chathub")
      .withAutomaticReconnect() // Habilitar reconexión automática
      .build();

    this.startConnection(); // Iniciar la conexión cuando el servicio se instancie
    this.initializeMessageListener();
  }

  // Método para iniciar la conexión y manejar reconexiones automáticas
  private startConnection() {
    this.hubConnection.start()
      .then(() => {
        console.log("Connection started");
        this.connectionStarted = true;
      })
      .catch(err => {
        console.error("Error while starting connection:", err);
        this.connectionStarted = false;
        setTimeout(() => this.startConnection(), 5000); // Reintentar conexión después de 5 segundos
      });

    // Marcar como reconectado cuando la conexión se restablece
    this.hubConnection.onreconnected(() => {
      console.log("Reconnected");
      this.connectionStarted = true;
    });

    // Manejar cierre de conexión y reintentar
    this.hubConnection.onclose(() => {
      console.log("Connection closed");
      this.connectionStarted = false;
      setTimeout(() => this.startConnection(), 5000); // Reintentar conexión al cerrarse
    });
  }

  // Método para enviar un mensaje solo si la conexión está establecida
  async sendMessage(user: string, message: string) {
    if (this.connectionStarted) { // Verificar si la conexión está establecida
      try {
        await this.hubConnection.invoke("SendMessage", user, message);
      } catch (err) {
        console.error("Error sending message:", err);
      }
    } else {
      console.warn("Cannot send message: Connection is not established.");
    }
  }

  // Configuración para recibir mensajes desde el backend
  private initializeMessageListener() {
    this.hubConnection.on("ReceiveMessage", (user: string, message: string) => {
      this.messageSource.next({ user, message });
    });
  }
}
