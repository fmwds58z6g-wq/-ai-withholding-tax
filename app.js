'use strict';
const $ = (id) => document.getElementById(id);
const fmt = (n) => new Intl.NumberFormat('th-TH',{minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(n||0));
const baht = (n) => `${fmt(n)} บาท`;

const SOURCES = {
  main: {title:'คำสั่งกรมสรรพากร ท.ป.4/2528 และฉบับแก้ไข',url:'https://www.rd.go.th/3479.html'},
  ad: {title:'คำสั่งกรมสรรพากร ป.6/2528 (ค่าโฆษณา)',url:'https://www.rd.go.th/3617.html'},
  sale: {title:'คำชี้แจงกรมสรรพากร: ตัวอย่างการขายสินค้าพร้อมค่าขนส่ง',url:'https://www.rd.go.th/3326.html'},
  delivery: {title:'ข้อหารือ กค 0706/3978 (ขายสินค้าพร้อมบริการขนส่ง)',url:'https://www.rd.go.th/31586.html'},
  transport: {title:'ข้อหารือ กค 0702/6873 (ค่าขนส่งเอกชน 1%)',url:'https://www.rd.go.th/39321.html'},
  filing: {title:'กำหนดเวลายื่นแบบหัก ณ ที่จ่าย',url:'https://www.rd.go.th/46202.html'}
};

const TESTS = [
 {id:1,title:'ค่าเช่าสำนักงาน',recipient:'company',category:'rent',amount:30000,vat:0,desc:'บริษัท XYZ จำกัด ค่าเช่าสำนักงานรายเดือน',result:'หัก 5% = 1,500 บาท; ภ.ง.ด.53',note:'ค่าเช่าทรัพย์สินตามมาตรา 40(5)(ก)'},
 {id:2,title:'ค่าเช่าจากบุคคลธรรมดา',recipient:'individual',category:'rent',amount:12000,vat:0,desc:'ค่าเช่าอาคารให้บุคคลธรรมดาไทย',result:'หัก 5% = 600 บาท; ภ.ง.ด.3',note:'อัตราค่าเช่า 5% เช่นเดียวกัน แต่แบบนำส่งเปลี่ยนตามผู้รับ'},
 {id:3,title:'บริการทำความสะอาด',recipient:'company',category:'service',amount:20000,vat:1400,desc:'บริษัท Clean Pro จำกัด ค่าบริการ 20,000 + VAT 7%',result:'หัก 3% ของ 20,000 = 600 บาท; จ่ายสุทธิ 20,800 บาท; ภ.ง.ด.53',note:'คิดภาษีจากค่าบริการก่อน VAT ที่แยกแสดง'},
 {id:4,title:'ค่าจ้างทำของ',recipient:'individual',category:'hirework',amount:15000,vat:0,desc:'ผู้รับจ้างจัดหาวัสดุสำคัญเอง ผลิตชั้นวางเอกสาร',result:'หัก 3% = 450 บาท; ภ.ง.ด.3',note:'ต้องพิจารณาเนื้อหาสัญญา/วัสดุและจัดประเภทเงินได้ให้ถูกต้อง'},
 {id:5,title:'ค่าโฆษณา',recipient:'company',category:'advertising',amount:25000,vat:1750,desc:'บริษัท Media Thai จำกัด เผยแพร่โฆษณาบนสื่อ',result:'หัก 2% ของ 25,000 = 500 บาท; จ่ายสุทธิ 26,250 บาท; ภ.ง.ด.53',note:'จำแนกตามเนื้อหาว่าเป็นค่าโฆษณา ไม่ใช่บริการทั่วไป'},
 {id:6,title:'ค่าขนส่งสินค้า',recipient:'company',category:'transport',amount:18000,vat:0,desc:'บริษัท Fast Transport จำกัด รับจ้างขนส่งสินค้าเป็นกิจการเฉพาะ',result:'หัก 1% = 180 บาท; ภ.ง.ด.53',note:'ผู้ให้บริการต้องเป็นผู้ประกอบกิจการขนส่ง และไม่มีบริการอื่นปะปน'},
 {id:7,title:'ซื้อสินค้าพร้อมจัดส่ง',recipient:'company',category:'goodsdelivery',amount:42000,vat:0,desc:'ซื้อสินค้า 40,000 + ค่าจัดส่ง 2,000 จากผู้ขายซึ่งไม่ได้ทำขนส่งเป็นปกติ',result:'ไม่หัก ณ ที่จ่ายตามข้อเท็จจริง; ขอข้อมูล VAT/ใบกำกับภาษีเพื่อยืนยันยอดรวม',note:'ค่าขนส่งเป็นส่วนหนึ่งของการขายสินค้า แม้แยกบรรทัด หากผู้ขายไม่ได้ประกอบกิจการขนส่งเป็นปกติ'},
 {id:8,title:'ค่าห้องพักโรงแรม',recipient:'company',category:'hotel',amount:8000,vat:0,desc:'บริษัท Hotel Thai จำกัด ใบเรียกเก็บเงินค่าห้องพัก',result:'ไม่หัก ณ ที่จ่าย สำหรับค่าบริการของโรงแรม',note:'ข้อ 12/1 ยกเว้นค่าบริการของโรงแรมจากบริการทั่วไป'},
 {id:9,title:'ค่าอาหารภัตตาคาร',recipient:'company',category:'restaurant',amount:3500,vat:0,desc:'บริษัท Restaurant Thai จำกัด ประกอบกิจการภัตตาคาร ใบเรียกเก็บเงินค่าอาหารประชุม',result:'ไม่หัก ณ ที่จ่าย สำหรับบริการภัตตาคาร',note:'ข้อ 12/1 ยกเว้นค่าบริการภัตตาคาร'},
 {id:10,title:'ข้อมูลกำกวม: ค่าดำเนินการ',recipient:'unknown',category:'unclear',amount:10000,vat:0,desc:'เอกสารระบุเพียงค่าดำเนินการ จ่ายให้คุณ ก.',result:'หยุดและถามข้อมูลเพิ่มเติม; ยังห้ามคำนวณอัตรา',note:'ต้องทราบสถานะผู้รับและเนื้อหางานก่อนจำแนกเงินได้'}
];

const KNOWLEDGE = [
 ['ค่าเช่าทรัพย์สิน','5%','ภ.ง.ด.3 / 53','บริษัท/นิติบุคคลไทยจ่ายค่าเช่าให้บุคคลธรรมดาหรือนิติบุคคลไทยทั่วไป; กรณีพิเศษ เช่น มูลนิธิ/สมาคมหรือ leasing ต้องตรวจแยก',SOURCES.main],
 ['บริการทั่วไป','3%','ภ.ง.ด.3 / 53','บริการอื่นตามมาตรา 40(8) ที่ไม่เข้าข้อยกเว้นหรือประเภทรายการเฉพาะ',SOURCES.main],
 ['ค่าจ้างทำของ','3%','ภ.ง.ด.3 / 53','ต้องวิเคราะห์เนื้อหางานและวัสดุที่ผู้รับจ้างจัดหา; ไม่ใช้ชื่อบัญชีอย่างเดียว',SOURCES.main],
 ['ค่าโฆษณา','2%','ภ.ง.ด.3 / 53','ค่าโฆษณาที่จ่ายแก่ผู้มีหน้าที่เสียภาษี; ตรวจว่ามีค่า media pass-through ในนามตัวแทนหรือไม่',SOURCES.ad],
 ['ค่าขนส่งเอกชน','1%','ภ.ง.ด.3 / 53','ไม่รวมค่าโดยสารขนส่งสาธารณะ; ต้องเป็นค่าขนส่งจริงและดูสัญญา/บริการประกอบ รวมเกณฑ์สัญญาตั้งแต่ 1,000 บาท',SOURCES.transport],
 ['ซื้อสินค้าพร้อมผู้ขายจัดส่ง','ไม่หัก (ตามข้อเท็จจริง)','ไม่มี','เมื่อผู้ขายไม่ได้ประกอบกิจการขนส่งเป็นปกติ ค่าสินค้ารวมค่าจัดส่งเป็นรายได้จากการขาย แม้แยกบรรทัด',SOURCES.sale],
 ['บริการโรงแรม','ไม่หัก (ค่าบริการโรงแรม)','ไม่มี','ข้อ 12/1 แยกค่าบริการโรงแรมออกจากบริการทั่วไป; ต้องแยกองค์ประกอบอื่นในใบแจ้งหนี้',SOURCES.main],
 ['บริการภัตตาคาร','ไม่หัก (ค่าบริการภัตตาคาร)','ไม่มี','ข้อ 12/1 นิยามภัตตาคารรวมการขายอาหาร/เครื่องดื่มและรับจ้างปรุงอาหาร',SOURCES.main]
];

const TYPE_LABEL = {company:'นิติบุคคลไทย',individual:'บุคคลธรรมดาไทย',foundation:'มูลนิธิ/สมาคม',foreign:'ผู้รับต่างประเทศ'};
function makeResult(input){
 const base=Number(input.amount),vat=input.vat===null?null:Number(input.vat||0),contract=Number(input.contractAmount||0),date=input.paymentDate;
 if(!date||!Number.isFinite(base)||base<=0) return {status:'stop',title:'ข้อมูลไม่ครบ',reasons:['กรุณาระบุวันที่จ่ายและจำนวนเงินก่อน VAT ให้ถูกต้อง']};
 if(date<'2026-01-01') return {status:'ask',title:'ต้องตรวจสอบกฎตามวันที่จ่าย',reasons:['ต้นแบบชุดนี้ตั้งค่ากฎปกติสำหรับการจ่ายตั้งแต่ 1 มกราคม 2569 เป็นต้นไป ไม่ประเมินธุรกรรมย้อนหลังอัตโนมัติ']};
 if(input.payerType!=='company') return {status:'ask',title:'ต้องตรวจสอบสถานะผู้จ่าย',reasons:['กฎในชุดนี้ออกแบบสำหรับผู้จ่ายที่เป็นบริษัท/นิติบุคคลไทยตามสมมติฐานใบงาน การจ่ายโดยบุคคลหรือหน่วยงานอื่นอาจใช้หลักเกณฑ์ต่างกัน']};
 if(input.recipientType==='foreign') return {status:'stop',title:'ส่งต่อผู้เชี่ยวชาญ',reasons:['ผู้รับเป็นต่างประเทศ ต้องตรวจประเภทเงินได้ แหล่งเงินได้ การประกอบกิจการในไทย อนุสัญญาภาษีซ้อน และแบบ ภ.ง.ด.54/ภาษีมูลค่าเพิ่มที่เกี่ยวข้อง']};
 if(input.recipientType==='foundation') return {status:'stop',title:'ส่งต่อผู้เชี่ยวชาญ',reasons:['ผู้รับเป็นมูลนิธิ/สมาคม อัตราและหน้าที่หักอาจต่างจากบุคคล/บริษัททั่วไป']};
 if(input.category==='unclear') return {status:'ask',title:'หยุดถามข้อมูลเพิ่มก่อนคำนวณ',reasons:['คุณ ก. เป็นบุคคลธรรมดาหรือนิติบุคคล?','ค่าดำเนินการคือการทำงาน/บริการอะไรโดยละเอียด?','มีสัญญา ใบเสนอราคา ใบแจ้งหนี้ หรือหลักฐานส่งมอบงานหรือไม่?','เป็นค่านายหน้า ค่าเช่า จ้างทำของ ขนส่ง โฆษณา หรือคืนเงินทดรองจ่าย?']};
 let rate=0,rule='',form='ไม่มี',sources=[SOURCES.main],classification='',notes=[];
 switch(input.category){
  case 'rent': rate=.05; rule='ท.ป.4/2528 ข้อ 6'; form=input.recipientType==='individual'?'ภ.ง.ด.3':'ภ.ง.ด.53'; classification='ค่าเช่าทรัพย์สิน ตามมาตรา 40(5)(ก)'; break;
  case 'service': rate=.03; rule='ท.ป.4/2528 ข้อ 12/1'; form=input.recipientType==='individual'?'ภ.ง.ด.3':'ภ.ง.ด.53'; classification='ค่าบริการอื่น/บริการทั่วไป'; notes.push('ตรวจว่าไม่ใช่ค่าบริการโรงแรม ภัตตาคาร ค่าโฆษณา ค่าขนส่ง หรือรายการเฉพาะอื่น'); break;
  case 'hirework': rate=.03; rule='ท.ป.4/2528 ข้อ 8'; form=input.recipientType==='individual'?'ภ.ง.ด.3':'ภ.ง.ด.53'; classification='ค่าจ้างทำของ (จำแนกตามเนื้อหาสัญญา)'; notes.push('กรณีบุคคลธรรมดา อัตรานี้ใช้กับค่าจ้างทำของที่เข้าลักษณะมาตรา 40(7) หรือ 40(8) ตามข้อ 8'); break;
  case 'advertising': rate=.02; rule='ท.ป.4/2528 ข้อ 10 และ ป.6/2528'; form=input.recipientType==='individual'?'ภ.ง.ด.3':'ภ.ง.ด.53'; classification='ค่าโฆษณา'; sources=[SOURCES.main,SOURCES.ad]; break;
  case 'transport':
    if(contract>0&&contract<1000) return {status:'ok',title:'ไม่ต้องหักตามเกณฑ์ยอดสัญญา',rate:0,base,vat,withheld:0,net:vat===null?null:base+vat,form:'ไม่มี',classification:'ค่าขนส่ง',rule:'ท.ป.4/2528 ข้อ 12/4 และข้อ 12/5',reasons:['มูลค่าตามสัญญารายนี้ต่ำกว่า 1,000 บาท ตามข้อมูลที่ระบุ'],sources:[SOURCES.main,SOURCES.transport]};
    rate=.01; rule='ท.ป.4/2528 ข้อ 12/4'; form=input.recipientType==='individual'?'ภ.ง.ด.3':'ภ.ง.ด.53'; classification='ค่าขนส่งเอกชน'; sources=[SOURCES.main,SOURCES.transport]; notes.push('ยืนยันว่าเป็นการรับขนโดยไม่มีบริการอื่นแฝง และตรวจยอดสัญญาตั้งแต่ 1,000 บาทขึ้นไป'); break;
  case 'goodsdelivery':
    if(input.sellerTransport==='unknown') return {status:'ask',title:'ต้องยืนยันลักษณะธุรกิจผู้ขาย',reasons:['ผู้ขายประกอบกิจการขนส่งเป็นปกติหรือไม่?','ค่าจัดส่งเป็นเพียงการส่งมอบสินค้าที่ขาย หรือเป็นบริการขนส่งอิสระตามสัญญา?','ยอด 42,000 บาทรวม VAT แล้วหรือยัง และมีใบกำกับภาษีแยกหรือไม่?']};
    if(input.sellerTransport==='no'&&!input.separateScope){rate=0;rule='คำชี้แจงกรมสรรพากรและข้อหารือ กค 0706/3978';form='ไม่มี';classification='การขายสินค้าพร้อมจัดส่ง';sources=[SOURCES.sale,SOURCES.delivery];notes.push('ถือค่าขนส่งเป็นส่วนหนึ่งของการขายสินค้า แม้แยกรายการในใบแจ้งหนี้'); if(vat===null) notes.push('ต้องถามเพิ่มว่า 42,000 บาทรวม VAT แล้วหรือไม่ และมีใบกำกับภาษี/ใบแจ้งหนี้แยกอย่างไร');}
    else if(input.sellerTransport==='yes'||input.separateScope){return {status:'ask',title:'ต้องแยกวิเคราะห์ค่าขนส่ง',reasons:['พบข้อเท็จจริงว่าผู้ขายทำธุรกิจขนส่งหรือมีขอบเขตบริการขนส่งแยกต่างหาก','แยกราคาสินค้า ค่าขนส่ง สัญญา ผู้รับจ้างจริง และหลักฐานส่งมอบ เพื่อพิจารณาอัตรา 1% หรือรายการอื่น','อย่าคำนวณจากยอดรวมจนกว่าจะทราบองค์ประกอบของค่าตอบแทน']};}
    break;
  case 'hotel': rate=0;rule='ท.ป.4/2528 ข้อ 12/1';form='ไม่มี';classification='ค่าบริการของโรงแรม (ข้อยกเว้น)';notes.push('หากใบแจ้งหนี้รวมบริการให้เช่าพื้นที่ จัดเลี้ยง หรือบริการอื่น ต้องแยกรายการก่อนวินิจฉัย');break;
  case 'restaurant': rate=0;rule='ท.ป.4/2528 ข้อ 12/1';form='ไม่มี';classification='ค่าบริการของภัตตาคาร (ข้อยกเว้น)';notes.push('ข้อ 12/1 นิยามภัตตาคารครอบคลุมการขายอาหาร/เครื่องดื่มและรับจ้างปรุงอาหาร');break;
  default:return {status:'ask',title:'ต้องตรวจสอบเพิ่มเติม',reasons:['ประเภทรายการนี้ยังไม่อยู่ในกฎที่ต้นแบบรองรับ']};
 }
 const withheld=Math.round((base*rate+Number.EPSILON)*100)/100;
 return {status:'ok',title:rate>0?'เข้าข่ายหักภาษี ณ ที่จ่าย':'ไม่เข้าข่ายหักภาษี ณ ที่จ่ายตามข้อเท็จจริง',rate,base,vat,withheld,net:vat===null?null:base+vat-withheld,form,classification,rule,reasons:[rate>0?`คำนวณ ${fmt(rate*100)}% × ${baht(base)} = ${baht(withheld)}`:'อัตราภาษีหัก ณ ที่จ่าย 0% ตามข้อเท็จจริงที่ให้มา',...notes],sources};
}

function getInputs(){return {paymentDate:$('paymentDate').value,payerType:$('payerType').value,recipientType:$('recipientType').value,category:$('category').value,description:$('description').value,amount:$('amount').value,vat:$('vat').value===''?null:$('vat').value,contractAmount:$('contractAmount').value,sellerTransport:$('sellerTransport').value,separateScope:$('separateScope').checked};}
function renderResult(r,input){
 const node=$('result');
 if(r.status!=='ok'){
  const status=r.status==='stop'?'stop':'ask';
  node.className='result';
  node.innerHTML=`<div class="result-head"><div><span class="status ${status}">${r.status==='stop'?'ต้องส่งต่อผู้เชี่ยวชาญ':'ต้องถามข้อมูลเพิ่ม'}</span><h3>${r.title}</h3></div></div><div class="result-block"><h4>ข้อมูลที่ต้องดำเนินการ</h4><ul>${r.reasons.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul></div><div class="footnote">ระบบไม่คำนวณอัตราภาษีเมื่อข้อมูลสำคัญไม่ครบหรืออยู่นอกขอบเขต</div>`;
  return;
 }
 node.className='result';
 const badge=r.rate>0?'<span class="status ok">ต้องหัก</span>':'<span class="status ask">ไม่หักตามข้อเท็จจริง</span>';
 node.innerHTML=`<div class="result-head"><div>${badge}<h3>${r.title}</h3><p>${escapeHtml(r.classification||'')}</p></div><div><button class="button secondary" id="printResult">พิมพ์ / บันทึก PDF</button></div></div>
 <div class="metrics">
  <div class="metric"><span>อัตราหัก ณ ที่จ่าย</span><strong>${fmt(r.rate*100)}%</strong></div>
  <div class="metric"><span>ฐานภาษี (ก่อน VAT)</span><strong>${baht(r.base)}</strong></div>
  <div class="metric"><span>ภาษีที่หัก</span><strong>${baht(r.withheld)}</strong></div>
  <div class="metric"><span>ยอดจ่ายสุทธิ</span><strong>${r.net===null?'รอยืนยัน VAT':baht(r.net)}</strong></div>
 </div>
 <div class="result-block"><h4>สรุปการนำส่ง</h4><p>แบบที่เกี่ยวข้อง: <strong>${r.form}</strong> · VAT: ${r.vat===null?'ยังไม่ระบุ':baht(r.vat)} · ยอดก่อนหักรวม VAT: ${r.vat===null?'รอยืนยัน VAT':baht(r.base+r.vat)}</p><p>สูตร: ฐานภาษีก่อน VAT × อัตราหัก = ${baht(r.withheld)}</p></div>
 <div class="result-block"><h4>เหตุผลและข้อควรระวัง</h4><ul>${r.reasons.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul><p>ฐานกฎหมายที่ใช้: <strong>${escapeHtml(r.rule)}</strong></p></div>
 <div class="result-block"><h4>แหล่งกฎหมาย</h4><ul class="source-list">${(r.sources||[]).map(s=>`<li><a href="${s.url}" target="_blank" rel="noopener">${escapeHtml(s.title)}</a></li>`).join('')}</ul></div>
 <div class="footnote">สมมติฐาน: ผู้จ่ายเป็นบริษัทไทย, ผู้รับอยู่ในประเทศไทย, ใช้อัตราปกติ, ไม่มีข้อเท็จจริงพิเศษ และคำนวณ VAT แยกจากฐาน WHT ตามช่องข้อมูลที่ป้อน · ต้องตรวจเอกสารต้นฉบับก่อนใช้งานจริง</div>`;
 $('printResult').addEventListener('click',()=>window.print());
}
function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function loadTest(t){
 $('paymentDate').value='2026-11-09';$('payerType').value='company';$('recipientType').value=t.recipient==='unknown'?'individual':t.recipient;$('category').value=t.category;$('description').value=t.desc;$('amount').value=t.id===7?42000:t.amount;$('vat').value=t.id===7?'':t.vat;$('contractAmount').value=t.id===6?18000:'';$('sellerTransport').value=t.id===7?'no':'unknown';$('separateScope').checked=false;
 document.querySelector('[data-tab="calculator"]').click();
 const r=makeResult(getInputs());renderResult(r,getInputs());
}
function renderTests(){ $('testList').innerHTML=TESTS.map(t=>`<article class="test-card"><h3>${t.id}. ${t.title}</h3><p>${escapeHtml(t.desc)}</p><div class="test-meta"><span>${escapeHtml(t.result)}</span><button class="text-link" data-test="${t.id}">ทดลองกรณีนี้ →</button></div></article>`).join('');document.querySelectorAll('[data-test]').forEach(b=>b.addEventListener('click',()=>loadTest(TESTS.find(t=>t.id===Number(b.dataset.test))))); }
function renderKnowledge(){ $('knowledgeRows').innerHTML=KNOWLEDGE.map(row=>`<tr><td><strong>${row[0]}</strong></td><td>${row[1]}</td><td>${row[2]}</td><td>${row[3]}</td><td><a href="${row[4].url}" target="_blank" rel="noopener">เปิดแหล่งอ้างอิง</a></td></tr>`).join(''); }

document.querySelectorAll('.tab').forEach(tab=>tab.addEventListener('click',()=>{document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t===tab));document.querySelectorAll('.panel').forEach(p=>p.classList.toggle('active',p.id===tab.dataset.tab));}));
$('whtForm').addEventListener('submit',e=>{e.preventDefault();const input=getInputs();renderResult(makeResult(input),input);});
$('resetBtn').addEventListener('click',()=>{$('whtForm').reset();$('paymentDate').value='2026-11-09';$('result').className='result empty';$('result').innerHTML='<div class="empty-icon">฿</div><h3>รอข้อมูลเพื่อวิเคราะห์</h3><p>กรอกแบบฟอร์มแล้วกด “วิเคราะห์และคำนวณ” เพื่อดูผลลัพธ์ อัตรา ภาษีหัก และเหตุผลทางกฎหมาย</p>';});
$('fillSampleBtn').addEventListener('click',()=>loadTest(TESTS[2]));
renderTests();renderKnowledge();
