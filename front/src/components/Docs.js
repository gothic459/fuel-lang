const Docs = () => {
    return ( 
        <div class="stackedit__html"><h1 id="fuel-language">Fuel Language</h1>
        <p>fuel language is a simple DSL based on this <a href="./model-doc.pdf">model</a>.<br/>
        Using <a href="https://www.antlr.org/">ANTLR4</a> :</p>
        <ul>
        <li>I wrote a simple <a href="https://github.com/gothic459/fuel-lang/blob/main/front/src/parser/Fire.g4">grammar</a></li>
        <li>Used <a href="https://github.com/tunnelvisionlabs/antlr4ts">antlr4ts</a> to generate a <a href="https://github.com/gothic459/fuel-lang/blob/main/front/src/parser/FireParser.ts">parser</a> and a <a href="https://github.com/gothic459/fuel-lang/blob/main/front/src/parser/FireLexer.ts">lexer</a> targetting TypeScript</li>
        <li>In order to output the errors to my custom console I had to customize the ANTLR basic error listener avaliable <a href="https://github.com/gothic459/fuel-lang/blob/main/front/src/parser/FireErrorListener.ts">here </a></li>
        <li>I used the <a href="https://en.wikipedia.org/wiki/Visitor_pattern">visitor pattern</a> so I used the package to <a href="https://github.com/gothic459/fuel-lang/blob/main/front/src/parser/FireVisitor.ts">generate it as well</a></li>
        </ul>
        <p>After generating the parser, lexer and a basic visitor I implemented a <a href="https://github.com/gothic459/fuel-lang/blob/main/front/src/parser/Visitor.ts">custom visitor</a> that allowed to<br />
        traverse the parse tree and output valid code.</p>
        <h1 id="documentation">Documentation</h1>
        <h2 id="types">Types</h2>
        <p>according to the <a href="">model</a> we distinguish between 4 primitive types:</p>
        <ul>
        <li><strong>ENT</strong><br/>
        defines an Entity<br/>
        eg.</li>
        </ul>
        <pre><code>    
        ENT KONTENER_0001 = &#123;
                "entity_type": "Kontener",
                "entitiy_name": "Kontener nr1"
            &#125;
        </code></pre>
        <ul>
        <li><strong>ACT</strong><br/>
        defines an Activity, requires <strong>result</strong> and <strong>entitiy</strong> field</li>
        </ul>
        <pre><code>    
        ACT POMIAR_TEMPERATURY_0002 = &#123;
                "type":"pomiar temperatury",
                "result":"25",
                "entity": "CZUJNIK_0002"
            &#125;
        </code></pre>
        <ul>
        <li><strong>EVT</strong><br/>
        defines an Event<br/>
        requires a <strong>goal</strong> field</li>
        </ul>
        <pre><code>   
         EVT ALERT_0002 = &#123;
                "name":"alert nr2 sredni stopien zagrozenia",
                "goal":"powiadom ochrone",
                "location": "ul. Warszawska 15A, 42-200 Częstochowa, I piętro, pierwszy kontener od okna",
                "subject": "CZUJNIK_0002",
                "state": "active"
                &#125;
        </code></pre>
        <ul>
        <li><strong>REL =&gt; as</strong><br/>
        defines a Relation</li>
        </ul>
        <pre><code>    
        'REL PALIWO_0002 =&gt; KONTENER_0002 as REL_0004 = &#123;
                "name": "Paliwo 2 znajduje sie w Kontenerze 2",
                "state": "active"
            }
        </code></pre>
        <hr />
        <h3 id="other-types"><em>Other types</em></h3>
        <ul>
        <li>number</li>
        <li>int</li>
        <li>bool</li>
        <li>string</li>
        <li>number</li>
        <li>array</li>
        <li>object</li>
        </ul>
        <h2 id="statements">Statements</h2>
        <ul>
        <li>assignment
        <ul>
        <li><code>let</code> <strong>variableName</strong> <code>=</code> <strong>array | value</strong></li>
        </ul>
        </li>
        <li>print
        <ul>
        <li><code>print</code> <strong>definedVariable</strong></li>
        </ul>
        </li>
        <li>relation
        <ul>
        <li><code>REL</code> <strong>definedVariable</strong> <code>=&gt;</code> <strong>definedVariable</strong> <code>as</code> <strong>newVariableName</strong></li>
        </ul>
        </li>
        <li>ifThenDo
        <ul>
        <li><code>IF</code><strong>ACT</strong><code>.</code><strong>fieldRef</strong><code>DO</code> <strong>EVT</strong><code>.</code><strong>fieldRef</strong></li>
        </ul>
        </li>
        </ul>
        <pre><code>IF POMIAR_TEMPERATURY_0001.result &gt; 30
        DO ALERT_0001.goal 
        </code></pre>
        <p>results in</p>
        <pre><code>invoker: CZUJNIK_0001
        activity: POMIAR_TEMPERATURY_0001
        event: alert nr1 najwyzszy stopien zagrozenia
        eventGoal: powiadom ochrone, straz pozarna, wojsko
        eventLocation: ul. Warszawska 15A, 42-200 Częstochowa, I piętro, pierwszy kontener od okna
        invokerDesc: Czujnik1 znajduje sie w Kontenerze 1
        </code></pre>
        <h2 id="comments">Comments</h2>
        <p><code>//this is a single line comment</code></p>
        <p><code>/* this is a multi-line comment */</code></p>
        </div>
        
     );
}
 
export default Docs;