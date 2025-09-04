<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\DatabaseMessage;

class StockRequestStatusChanged extends Notification
{
    use Queueable;

    protected $request;

    public function __construct($request)
    {
        $this->request = $request;
    }

    public function via($notifiable)
    {
        $channels = ['database'];
        if ($notifiable && isset($notifiable->email) && $notifiable->email) {
            $channels[] = 'mail';
        }
        return $channels;
    }

    public function toDatabase($notifiable)
    {
        return [
            'type' => 'stock_request_status_changed',
            'request_id' => $this->request->id,
            'status' => $this->request->status,
            'message' => 'Status permintaan stok diubah: ' . $this->request->status,
        ];
    }

    public function toMail($notifiable)
    {
        $url = route('stock-requests.show', $this->request->id);
        return (new \Illuminate\Notifications\Messages\MailMessage)
            ->subject('Status Permintaan Stok Diubah')
            ->line('Status permintaan stok Anda telah diubah menjadi: ' . $this->request->status)
            ->action('Lihat Permintaan', $url)
            ->line('Terima kasih.');
    }
}
