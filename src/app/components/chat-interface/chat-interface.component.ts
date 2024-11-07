import { Component } from '@angular/core';
import { ServiceChatService } from '../../services/service-chat.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat-interface',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-interface.component.html',
  styleUrl: './chat-interface.component.css'
})
export class ChatInterfaceComponent {
  user: string = '';
  message: string = '';
  messages: {user: string, message: string}[] = [];

  constructor(private chatService: ServiceChatService) {}

  ngOnInit() {
    // Suscribirse a los mensajes entrantes desde el servicio de chat
    this.chatService.currentMessage.subscribe((msg) => {
      if (msg) {
        this.messages.push(msg);
      }
    });
  }

  sendMessage() {
    if (this.user && this.message) {
      // Enviar el mensaje usando el servicio de chat
      this.chatService.sendMessage(this.user, this.message);
      this.message = ''; // Limpiar el campo de mensaje después de enviar
    }
  }
}
