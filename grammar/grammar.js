// Editor syntax only; neo_image_parse remains the validation authority.
module.exports = grammar({
  name: 'neo',
  extras: $ => [/[\s\u000b\u000c]+/, $.comment],
  rules: {
    document: $ => $.object,
    object: $ => seq('(', field('name', $._token), optional($.label),
      optional($.payload), repeat(choice($.object, $.edge)), ')'),
    label: $ => token(/#[^\s()>]+/),
    payload: $ => choice(
      ':object',
      seq(':integer', field('integer', $._token)),
      seq(':boolean', field('boolean', $._token)),
      seq(':text', field('text', $._token)),
      seq(':primitive', field('primitive', $._token))),
    edge: $ => seq('@', field('name', $._token),
      field('target', $._token), field('rights', $._token)),
    // The VM accepts quoted numbers/booleans and broad bare tokens. Keep them
    // contextual rather than rejecting valid data in the editor grammar.
    _token: $ => choice($.string, $.bare),
    bare: $ => token(/[^\s()>"\x00][^\s()>\x00]*/),
    string: $ => seq('"', repeat(choice($.escape, $.string_content)), '"'),
    string_content: $ => token.immediate(/[^"\\\x00-\x1f]+/),
    escape: $ => token.immediate(/\\["\\nrt]/),
    comment: $ => token(seq('>', /[^\n]*/)),
  },
});
