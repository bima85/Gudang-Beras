<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\DatabaseMessage;

class StockRequestCreated extends Notification
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
            'type' => 'stock_request_created',
            'request_id' => $this->request->id,
            'product_id' => $this->request->product_id,
            'qty' => $this->request->qty,
            'message' => 'Permintaan stok baru dibuat',
        ];
    }

    public function toMail($notifiable)
    {
        $url = route('stock-requests.show', $this->request->id);
        return (new \Illuminate\Notifications\Messages\MailMessage)
            ->subject('Permintaan Stok Baru')
            ->line('Ada permintaan stok baru untuk product ID: ' . $this->request->product_id)
            ->line('Jumlah: ' . $this->request->qty)
            ->action('Lihat Permintaan', $url)
            ->line('Silakan cek dan approve jika sesuai.');
    }
}
