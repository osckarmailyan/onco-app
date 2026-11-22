/** Pure message builder: duration comes from the booking snapshot, not today's service configuration. */
export function buildMeetingConfirmation(booking: {
  requires_reschedule: boolean;
  duration_label: string;
  meeting_slots: { starts_at: string; meeting_url: string };
}, settings: {timeZone: string; supportEmail: string}) {
  const { starts_at, meeting_url } = booking.meeting_slots;
  const date = new Intl.DateTimeFormat('ru-RU',{timeZone:settings.timeZone,dateStyle:'full',timeStyle:'short'}).format(new Date(starts_at));
  if (booking.requires_reschedule) return {
    subject:'OncoExperts — оплата получена, согласуем время',
    text:`Оплата вашей индивидуальной встречи получена.\n\nВыбранное время (${date}, московское время) уже наступило к моменту подтверждения платежа. Не оплачивайте повторно.\n\nПожалуйста, напишите ${settings.supportEmail}: мы согласуем дальнейшие действия и новое время встречи. Не нужно отправлять медицинские документы.\n\nЭто письмо подтверждает получение оплаты, а время встречи нужно согласовать отдельно.`,
  };
  return {
    subject:'OncoExperts — встреча подтверждена',
    text:`Ваша индивидуальная встреча подтверждена.\n\nКогда: ${date} (московское время).\nПродолжительность: ${booking.duration_label}.\n\nПодключиться к видеозвонку: ${meeting_url}\n\nЗа несколько минут до встречи откройте ссылку и проверьте микрофон и камеру. Специально готовиться или собирать документы не нужно.\n\nПеренос и вопросы: ${settings.supportEmail}.\n\nСохраните это письмо; ссылка предназначена только для вас.`,
  };
}
